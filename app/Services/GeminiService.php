<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class GeminiService
{
    public function generateRabItems(Project $project, string $description, array $materials = []): array
    {
        $prompt = $this->buildRabPrompt($project, $description, $materials);
        $text = $this->generateJson($prompt, 0.4);

        return $this->parseItems($text);
    }

    public function analyzeRab(Project $project, array $items, array $summary): array
    {
        $prompt = $this->buildAnalysisPrompt($project, $items, $summary);
        $text = $this->generateJson($prompt, 0.3);

        return $this->parseAnalysis($text);
    }

    public function answerAssistant(Project $project, string $question, array $items, array $summary, array $materials): array
    {
        $prompt = $this->buildAssistantPrompt($project, $question, $items, $summary, $materials);
        $text = $this->generateJson($prompt, 0.5);

        return $this->parseAssistantAnswer($text);
    }

    public function estimateHouse(array $houseData): array
    {
        $prompt = $this->buildHouseEstimatePrompt($houseData);
        $text = $this->generateJson($prompt, 0.4);

        return $this->parseHouseEstimate($text);
    }

    private function buildHouseEstimatePrompt(array $houseData): string
    {
        $payload = json_encode($houseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

        return <<<PROMPT
Kamu adalah estimator kontraktor Indonesia.
Buat estimasi biaya rumah tinggal berdasarkan data berikut.

DATA:
{$payload}

Balas hanya JSON valid tanpa markdown, tanpa penjelasan, dengan struktur:
{
  "summary": "ringkasan singkat estimasi",
  "total_estimate": 850000000,
  "breakdown": [
    {
      "name": "Struktur",
      "amount": 320000000
    }
  ],
  "notes": [
    "catatan tambahan"
  ]
}

Aturan:
- Total estimasi harus dalam angka bulat Rupiah.
- Breakdown harus berisi 4 sampai 6 kategori biaya utama.
- Gunakan bahasa Indonesia yang langsung dan praktis.
- Sertakan opsi tambahan yang dipilih dalam rekomendasi biaya jika ada.
- Jika data belum lengkap, tambahkan catatan singkat di notes.
- Jangan tambahkan penjelasan lain selain JSON.
PROMPT;
    }

    private function parseHouseEstimate(string $text): array
    {
        $decoded = $this->decodeJson($text);

        if (! is_array($decoded)) {
            throw new RuntimeException('Response estimasi rumah bukan JSON valid.');
        }

        $breakdown = collect($decoded['breakdown'] ?? [])
            ->filter(fn ($item) => is_array($item))
            ->map(fn ($item) => [
                'name' => (string) ($item['name'] ?? ''),
                'amount' => (int) ($item['amount'] ?? 0),
            ])
            ->values()
            ->all();

        $notes = collect($decoded['notes'] ?? [])
            ->filter(fn ($note) => is_string($note) && $note !== '')
            ->values()
            ->all();

        return [
            'summary' => (string) ($decoded['summary'] ?? ''),
            'total_estimate' => (int) ($decoded['total_estimate'] ?? 0),
            'breakdown' => $breakdown,
            'notes' => $notes,
        ];
    }

    private function generateJson(string $prompt, float $temperature): string
    {
        $apiKey = trim((string) config('services.gemini.api_key'));
        $model = trim((string) config('services.gemini.model', 'gemini-2.5-flash'));

        if (! $apiKey) {
            throw new RuntimeException('Konfigurasi layanan estimasi belum diisi di file .env.');
        }

        try {
            $response = Http::timeout(60)
                ->withHeaders([
                    'x-goog-api-key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => $temperature,
                        'responseMimeType' => 'application/json',
                    ],
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Tidak bisa terhubung ke layanan estimasi. Cek koneksi internet, firewall, proxy, atau DNS di komputer/server.');
        }

        if ($response->failed()) {
            $message = data_get($response->json(), 'error.message');

            throw new RuntimeException('Layanan estimasi gagal memproses permintaan. Status: '.$response->status().($message ? " ({$message})" : ''));
        }

        $text = data_get($response->json(), 'candidates.0.content.parts.0.text');

        if (! $text) {
            throw new RuntimeException('Response layanan estimasi kosong atau formatnya tidak sesuai.');
        }

        return $text;
    }

    private function buildRabPrompt(Project $project, string $description, array $materials): string
    {
        $payload = json_encode([
            'project' => [
                'name' => $project->project_name,
                'client' => $project->client_name,
                'status' => $project->status,
                'description' => $project->description,
            ],
            'user_scope' => $description,
            'known_material_prices' => $materials,
        ], JSON_PRETTY_PRINT);

        return <<<PROMPT
Kamu adalah estimator kontraktor Indonesia.
Buat draft item RAB awal berdasarkan data project, scope user, dan database material berikut.

DATA:
{$payload}

Balas hanya JSON valid tanpa markdown, tanpa penjelasan, dengan struktur:
{
  "items": [
    {
      "group_name": "Pekerjaan Persiapan",
      "name": "Pembersihan lahan",
      "material": "Tenaga kerja",
      "category": "jasa",
      "volume": 1,
      "unit": "ls",
      "unit_price": 1500000,
      "confidence": "medium",
      "assumption": "Perkiraan luasan dan kondisi lapangan normal",
      "review_flag": "Validasi volume aktual di lapangan"
    }
  ]
}

Aturan:
- Prioritaskan harga dari known_material_prices jika material yang relevan tersedia.
- Jika harga material tidak tersedia, gunakan perkiraan pasar Indonesia dan buat konservatif.
- Buat 8 sampai 20 item utama yang benar-benar relevan dengan scope proyek.
- group_name harus memakai grup pekerjaan konstruksi seperti Persiapan, Pondasi, Struktur, Dinding, Atap, Finishing, MEP, atau Pekerjaan Luar.
- volume dan unit_price harus angka.
- confidence harus low, medium, atau high berdasarkan kelengkapan data.
- assumption wajib singkat dan menjelaskan asumsi harga/volume paling penting.
- review_flag wajib berisi hal yang harus dicek estimator sebelum item diterima.
- Jangan membuat item yang tidak didukung oleh data project/scope kecuali sebagai asumsi wajar.
- Jangan sertakan subtotal karena sistem akan menghitung otomatis.
PROMPT;
    }

    private function buildAnalysisPrompt(Project $project, array $items, array $summary): string
    {
        $payload = json_encode([
            'project' => [
                'name' => $project->project_name,
                'client' => $project->client_name,
                'status' => $project->status,
            ],
            'items' => $items,
            'summary' => $summary,
        ], JSON_PRETTY_PRINT);

        return <<<PROMPT
Kamu adalah estimator senior dan konsultan biaya proyek kontraktor Indonesia.
Analisa RAB berikut hanya dalam konteks konstruksi, biaya proyek, material, produktivitas, risiko, dan margin.

DATA:
{$payload}

Balas hanya JSON valid tanpa markdown, tanpa penjelasan, dengan struktur:
{
  "overview": "ringkasan singkat kondisi RAB",
  "risk_level": "low|medium|high",
  "estimated_margin_percent": 15,
  "expensive_items": [
    {
      "name": "Nama item",
      "reason": "alasan mahal",
      "suggestion": "saran efisiensi"
    }
  ],
  "saving_recommendations": [
    "rekomendasi penghematan"
  ],
  "material_recommendations": [
    "rekomendasi material alternatif"
  ],
  "profit_notes": [
    "catatan margin/profit"
  ],
  "data_gaps": [
    "data yang perlu dilengkapi"
  ],
  "next_actions": [
    {
      "priority": "high|medium|low",
      "action": "aksi berikutnya",
      "reason": "kenapa perlu dilakukan"
    }
  ]
}

Aturan:
- Jangan membahas topik di luar konstruksi/RAB/project/material.
- Jika data terlalu umum, sebutkan gap data spesifik dan rekomendasikan breakdown item pekerjaan.
- Beri saran yang bisa langsung dilakukan estimator, bukan saran umum yang terlalu luas.
- Prioritaskan next_actions berdasarkan dampak ke biaya, risiko scope, dan margin.
- Untuk item beton/pondasi/struktur yang belum punya material detail, sarankan pemecahan ke komponen seperti semen, pasir, kerikil, besi, bekisting, tenaga, atau alat jika relevan.
- Jangan mengarang merek, spesifikasi, atau kuantitas material yang tidak ada; boleh beri asumsi kasar hanya jika diberi label asumsi.
PROMPT;
    }

    private function buildAssistantPrompt(
        Project $project,
        string $question,
        array $items,
        array $summary,
        array $materials
    ): string {
        $payload = json_encode([
            'project' => [
                'name' => $project->project_name,
                'client' => $project->client_name,
                'status' => $project->status,
                'description' => $project->description,
            ],
            'rab_items' => $items,
            'summary' => $summary,
            'materials' => $materials,
            'question' => $question,
        ], JSON_PRETTY_PRINT);

        return <<<PROMPT
Kamu adalah estimator kontraktor Indonesia, bukan chatbot umum.
Jawab pertanyaan user hanya berdasarkan konteks project, RAB, biaya konstruksi, material, produktivitas, margin, risiko, dan database material berikut.

DATA:
{$payload}

Balas hanya JSON valid tanpa markdown, tanpa penjelasan tambahan, dengan struktur:
{
  "question": "pertanyaan user",
  "answer": "jawaban utama yang jelas dan praktis",
  "key_points": [
    "poin penting"
  ],
  "recommendations": [
    "rekomendasi tindakan"
  ],
  "follow_up_actions": [
    {
      "label": "aksi singkat",
      "detail": "detail tindakan"
    }
  ]
}

Aturan:
- Jika pertanyaan user mengandung topik di luar konstruksi/RAB/project/material, jangan menjelaskan topik tersebut. Cukup katakan bagian itu tidak relevan dengan RAB project ini, lalu fokus kembali ke konteks konstruksi.
- Jika seluruh pertanyaan di luar konteks RAB/konstruksi, jawab singkat bahwa kamu hanya membantu konteks RAB kontraktor dan minta pertanyaan terkait project.
- Jangan menjawab pengetahuan umum non-konstruksi seperti kosmologi, hiburan, politik, atau definisi istilah umum yang tidak terkait project.
- Jika data RAB belum cukup, sebutkan gap data spesifik, lalu beri langkah praktis untuk melengkapinya.
- Akhiri dengan follow_up_actions yang bisa langsung dilakukan estimator di sistem.
- Untuk item umum seperti footing, pekerjaan beton, pondasi, dinding, atau finishing yang belum punya material detail, sarankan breakdown ke item/material turunan yang bisa dicatat di RAB.
- Gunakan database material yang tersedia untuk menyarankan alternatif atau pengecekan harga. Jika material tidak ada di database, katakan perlu ditambahkan.
- Beri rekomendasi yang bisa langsung dilakukan estimator, bukan saran umum yang terlalu luas.
- Gunakan bahasa Indonesia yang ringkas.
- Jangan mengarang detail proyek yang tidak ada di data.
- Boleh memberi estimasi kasar jika user memang meminta estimasi, tapi sebutkan bahwa itu perkiraan awal.
PROMPT;
    }

    private function parseItems(string $text): array
    {
        $decoded = $this->decodeJson($text);

        if (! is_array($decoded)) {
            throw new RuntimeException('Response layanan estimasi bukan JSON valid.');
        }

        $items = $decoded['items'] ?? $decoded;

        if (! is_array($items)) {
            throw new RuntimeException('Response layanan estimasi tidak memiliki daftar items.');
        }

        return collect($items)
            ->filter(fn ($item) => is_array($item) && ! empty($item['name']))
            ->map(function ($item) {
                return [
                    'group_name' => $item['group_name'] ?? 'Draft RAB',
                    'name' => $item['name'],
                    'material' => $item['material'] ?? null,
                    'category' => $item['category'] ?? null,
                    'volume' => (float) ($item['volume'] ?? 0),
                    'unit' => $item['unit'] ?? null,
                    'unit_price' => (float) ($item['unit_price'] ?? 0),
                    'confidence' => $item['confidence'] ?? 'medium',
                    'assumption' => $item['assumption'] ?? null,
                    'review_flag' => $item['review_flag'] ?? null,
                ];
            })
            ->values()
            ->all();
    }

    private function parseAnalysis(string $text): array
    {
        $decoded = $this->decodeJson($text);

        if (! is_array($decoded)) {
            throw new RuntimeException('Response analisa biaya bukan JSON valid.');
        }

        return [
            'overview' => $decoded['overview'] ?? 'Analisa belum tersedia.',
            'risk_level' => $decoded['risk_level'] ?? 'medium',
            'estimated_margin_percent' => $decoded['estimated_margin_percent'] ?? null,
            'expensive_items' => $decoded['expensive_items'] ?? [],
            'saving_recommendations' => $decoded['saving_recommendations'] ?? [],
            'material_recommendations' => $decoded['material_recommendations'] ?? [],
            'profit_notes' => $decoded['profit_notes'] ?? [],
            'data_gaps' => $decoded['data_gaps'] ?? [],
            'next_actions' => $decoded['next_actions'] ?? [],
        ];
    }

    private function parseAssistantAnswer(string $text): array
    {
        $decoded = $this->decodeJson($text);

        if (! is_array($decoded)) {
            throw new RuntimeException('Response catatan estimator bukan JSON valid.');
        }

        return [
            'question' => $decoded['question'] ?? '',
            'answer' => $decoded['answer'] ?? 'Jawaban belum tersedia.',
            'key_points' => $decoded['key_points'] ?? [],
            'recommendations' => $decoded['recommendations'] ?? [],
            'follow_up_actions' => $decoded['follow_up_actions'] ?? [],
        ];
    }

    private function decodeJson(string $text): array
    {
        $json = trim($text);
        $json = preg_replace('/^```json\s*/', '', $json);
        $json = preg_replace('/^```\s*/', '', $json);
        $json = preg_replace('/\s*```$/', '', $json);

        $decoded = json_decode($json, true);

        if (! is_array($decoded)) {
            throw new RuntimeException('Response layanan estimasi bukan JSON valid.');
        }

        return $decoded;
    }
}
