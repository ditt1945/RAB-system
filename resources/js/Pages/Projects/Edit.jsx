import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

export default function Edit({ auth, project }) {

    const { data, setData, put, processing, errors } = useForm({
        project_name: project.project_name || '',
        client_name: project.client_name || '',
        description: project.description || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'planning',
    });

    const submit = (e) => {
        e.preventDefault();

        put(route('projects.update', project.id));
    };

    return (
        <AppLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="page-title">Edit Project</h2>
                    <p className="section-copy mt-1">Perbarui informasi project dan status pekerjaan.</p>
                </div>
            }
        >
            <Head title="Edit Project" />

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
                                    rows="4"
                                    className="textarea-field"
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

                            <div className="flex flex-wrap gap-2">
                                <button type="submit" disabled={processing} className="btn-primary">
                                    Update Project
                                </button>
                            </div>

                        </form>
                    </div>
            </div>
        </AppLayout>
    );
}

