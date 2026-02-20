import { useResume } from '@/hooks/useResume';
import { Check, Eye, FileText, Loader2, Menu, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

const Header = () => {
    const {
        resetToDefaults,
        saveStatus,
    } = useResume();

    const { id } = useParams()
    const [previewOpen, setPreviewOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset? This will clear all your data and restore defaults.')) {
            resetToDefaults();
        }
    };

    return (
        <header className="sticky top-0 z-30 glass-card border-b border-border rounded-none">
            <div className="flex items-center justify-between h-16 px-4 md:px-6">
                {/* Left: Logo & Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="action-btn md:hidden"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-primary" />
                        </div>
                        <h1 className="text-lg font-semibold text-foreground hidden sm:block">
                            <a href="/">
                                Resume Builder
                            </a>
                        </h1>
                    </div>
                </div>

                {/* Center: Save Status */}
                <div className="flex items-center">
                    {saveStatus === 'saving' && (
                        <span className="status-badge-saving">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Saving...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="status-badge-saved">
                            <Check className="w-3 h-3" />
                            Saved
                        </span>
                    )}
                </div>

                {id != null && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPreviewOpen(true)}
                            className="neo-button-primary flex items-center gap-2 text-sm"
                        >
                            <Eye className="w-4 h-4" />
                            <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button
                            onClick={handleReset}
                            className="neo-button flex items-center gap-2 text-sm text-muted-foreground"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span className="hidden sm:inline">Reset</span>
                        </button>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Header