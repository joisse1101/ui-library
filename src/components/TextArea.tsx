import React, { useRef, useState } from 'react';
import { Button } from './Button';
import '../styles/_component_textarea.scss';

export const TextArea = ({ onSubmit }: { onSubmit: (text: string) => void }) => {
    const [logEntry, setLogEntry] = useState('');
    const hasContent = logEntry.trim().length > 0;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        setLogEntry(textarea.value);

        textarea.style.height = 'auto';

        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleSubmit = () => {
        if (hasContent) {
            onSubmit(logEntry);
            setLogEntry('');
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className="textarea-wrapper">
            <textarea
                ref={textAreaRef}
                placeholder="What's up?"
                value={logEntry}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            />
            {hasContent && (
                <span className="textarea-hint">
                    <span className="desktop">
                        Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
                    </span>
                    <span className="mobile">
                        <Button onClick={handleSubmit} variant="primary" icon={true}>
                            ➤
                        </Button>
                    </span>
                </span>
            )}
        </div>
    );
};