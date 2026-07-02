<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>404 - Page missing</title>
        <style>
            * {
                box-sizing: border-box;
            }

            body {
                margin: 0;
                min-height: 100vh;
                background: #ffffff;
                color: #222222;
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            .not-found {
                display: flex;
                min-height: 100vh;
                align-items: center;
                justify-content: center;
                padding: 24px;
                text-align: center;
            }

            .stack {
                animation: rise 0.7s cubic-bezier(0.43, 0.13, 0.23, 0.96) both;
            }

            .code {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: clamp(16px, 4vw, 28px);
                margin-bottom: clamp(32px, 5vw, 48px);
            }

            .code span {
                color: #222222;
                font-size: clamp(80px, 12vw, 120px);
                font-weight: 800;
                line-height: 1;
                opacity: 0.7;
                user-select: none;
            }

            .ghost {
                width: clamp(80px, 12vw, 120px);
                height: clamp(80px, 12vw, 120px);
                object-fit: contain;
                animation: float 2s ease-in-out infinite alternate;
                user-select: none;
            }

            h1 {
                margin: 0 0 18px;
                color: #222222;
                font-size: clamp(32px, 5vw, 52px);
                font-weight: 800;
                line-height: 1.1;
                opacity: 0.7;
            }

            p {
                margin: 0 auto 36px;
                max-width: 620px;
                color: #222222;
                font-size: clamp(18px, 2vw, 22px);
                opacity: 0.52;
            }

            .button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-height: 48px;
                border-radius: 999px;
                background: #222222;
                color: #ffffff;
                padding: 12px 32px;
                font-size: 18px;
                font-weight: 700;
                text-decoration: none;
                transition: background 0.2s ease, transform 0.2s ease;
            }

            .button:hover {
                background: #000000;
                transform: translateY(-1px);
            }

            .link {
                display: inline-block;
                border: 0;
                background: transparent;
                cursor: pointer;
                font: inherit;
                margin-top: 42px;
                color: #222222;
                opacity: 0.5;
                padding: 0;
                text-decoration: underline;
            }

            .link:hover,
            .link:focus-visible {
                opacity: 0.72;
            }

            .explanation {
                display: none;
                margin: 18px auto 0;
                max-width: 520px;
                border: 1px solid rgba(34, 34, 34, 0.12);
                border-radius: 14px;
                background: #fafafa;
                padding: 18px 20px;
                color: rgba(34, 34, 34, 0.68);
                font-size: 15px;
                line-height: 1.6;
                text-align: left;
            }

            .explanation strong {
                display: block;
                margin-bottom: 6px;
                color: rgba(34, 34, 34, 0.82);
                font-size: 16px;
            }

            .explanation:target {
                display: block;
            }

            @keyframes rise {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            @keyframes float {
                from {
                    transform: translateY(-5px);
                }
                to {
                    transform: translateY(5px);
                }
            }
        </style>
    </head>
    <body>
        <main class="not-found">
            <div class="stack">
                <div class="code" aria-label="404">
                    <span>4</span>
                    <img
                        src="https://xubohuah.github.io/xubohua.top/Group.png"
                        alt="Ghost"
                        class="ghost"
                        draggable="false"
                    >
                    <span>4</span>
                </div>

                <h1>Boo! Page missing!</h1>
                <p>Whoops! This page must be a ghost - it&apos;s not here!</p>

                <a href="{{ url('/') }}" class="button">Find shelter</a>
                <br>
                <a href="#what-is-404" class="link">What means 404?</a>

                <section id="what-is-404" class="explanation" aria-label="What means 404">
                    <strong>404 berarti halaman tidak ditemukan.</strong>
                    Alamat yang kamu buka tidak cocok dengan route atau halaman mana pun di aplikasi ini. Biasanya karena link salah ketik, halaman sudah dipindah, atau data yang dicari sudah tidak tersedia.
                </section>
            </div>
        </main>
    </body>
</html>
