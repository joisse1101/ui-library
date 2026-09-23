import React, { useRef, useState } from 'react';
import { Button } from '@components/Button';
import styles from './TextArea.module.scss';

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
    onSubmit: (text: string) => void;
};

/**
 * `TextArea` is a React component that renders a resizable textarea input field with a submit button.
 * 
 * ### Features:
 * - Resizable textarea that adjusts its height based on the content entered.
 * - Submit functionality triggered by "Ctrl + Enter" (or "Cmd + Enter" on Mac) or by clicking the submit button.
 */
export const TextArea = ({ onSubmit, ...props }: TextAreaProps) => {
    const [text, setText] = useState('');
    const hasContent = text.trim().length > 0;
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const textarea = e.target;
        setText(textarea.value);

        textarea.style.height = 'auto';

        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    const handleSubmit = () => {
        if (hasContent) {
            onSubmit(text.trim());
            setText('');
            if (textAreaRef.current) {
                textAreaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className={styles['textarea-wrapper']}>
            <textarea
                {...props}
                ref={textAreaRef}
                placeholder={props.placeholder ?? "What's up?"}
                value={text}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
            />
            {hasContent && (
                <span className={styles['textarea-hint']}>
                    <span className={styles.desktop}>
                        Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to submit
                    </span>
                    <span className={styles.mobile}>
                        <Button onClick={handleSubmit} variant="primary" icon={true}>
                            ➤
                        </Button>
                    </span>
                </span>
            )}
        </div>
    );
};