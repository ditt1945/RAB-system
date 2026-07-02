import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Create({ auth, templates = [] }) {

    const { data, setData, post, processing, errors } = useForm({
        project_name: '',
        client_name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'planning',
        target_margin_percent: 15,
        template_id: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('projects.store'));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="page-title">Create Project</h2>
                    <p className="section-copy mt-1">Tambahkan project baru sebagai dasar penyusunan RAB.</p>
                </div>
            }
        >
            <Head title="Create Project" />

            <div className="form-shell">
                    <div className="panel-strong p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <label className="form-label">
                                    Project Name
                                </label>

                                <input
                                    type="text"
                                    value={data.project_name}
                                    onChange={(e) =>
                                        setData('project_name', e.target.value)
                                    }
                                    className="input-field"
                                />

                                {errors.project_name && (
                                    <div className="form-error">
                                        {errors.project_name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="form-label">
                                    Client Name
                                </label>

                                <input
                                    type="text"
                                    value={data.client_name}
                                    onChange={(e) =>
                                        setData('client_name', e.target.value)
                                    }
                                    className="input-field"
                                />

                                {errors.client_name && (
                                    <div className="form-error">
                                        {errors.client_name}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="textarea-field"
                                    rows="4"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label">
                                        Start Date
                                    </label>

                                    <input
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) =>
                                            setData('start_date', e.target.value)
                                        }
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="form-label">
                                        End Date
                                    </label>

                                    <input
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) =>
                                            setData('end_date', e.target.value)
                                        }
                                        className="input-field"
                                    />
                                    {errors.end_date && (
                                        <div className="form-error">{errors.end_date}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                    className="input-field"
                                >
                                    <option value="planning">Planning</option>
                                    <option value="progress">Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="form-label">
                                        Target Margin (%)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={data.target_margin_percent}
                                        onChange={(e) =>
                                            setData('target_margin_percent', e.target.value)
                                        }
                                        className="input-field"
                                    />
                                    {errors.target_margin_percent && (
                                        <div className="form-error">{errors.target_margin_percent}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="form-label">
                                        Template RAB
                                    </label>

                                    <select
                                        value={data.template_id}
                                        onChange={(e) =>
                                            setData('template_id', e.target.value)
                                        }
                                        className="input-field"
                                    >
                                        <option value="">Mulai dari kosong</option>
                                        {templates.map((template) => (
                                            <option key={template.id} value={template.id}>
                                                {template.name} ({template.items_count} item)
                                            </option>
                                        ))}
                                    </select>
                                    {errors.template_id && (
                                        <div className="form-error">{errors.template_id}</div>
                                    )}
                                </div>
                            </div>

                            {templates.length > 0 && (
                                <div className="grid gap-3 rounded-md border border-hairlineSoft bg-field p-4 md:grid-cols-3">
                                    {templates.slice(0, 3).map((template) => (
                                        <div key={template.id} className="rounded-md bg-white p-4">
                                            <p className="text-sm font-semibold text-ink">{template.name}</p>
                                            <p className="mt-1 text-xs text-mute">{template.category || 'Template'}</p>
                                            <p className="mt-2 text-sm leading-5 text-ash">{template.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <button type="submit" disabled={processing} className="btn-primary">
                                    Save Project
                                </button>
                            </div>

                        </form>
                    </div>
            </div>
        </AppLayout>
    );
}
