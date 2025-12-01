/**
 * Reusable form field component with validation feedback.
 */
import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

interface BaseFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

interface InputFieldProps extends BaseFieldProps, Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface TextareaFieldProps extends BaseFieldProps, Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  rows?: number;
}

export function FormField({ label, error, hint, required, ...props }: InputFieldProps | TextareaFieldProps) {
  const isTextarea = 'rows' in props;
  const fieldId = props.id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;

  const inputClasses = `
    block w-full rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm transition-colors
    ${hasError 
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' 
      : 'border-slate-300 text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-primary-500'
    }
    ${props.disabled ? 'bg-slate-50 cursor-not-allowed' : 'bg-white'}
    ${isTextarea ? 'py-2.5 px-3' : 'py-2.5 px-3'}
  `;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={fieldId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...(props as TextareaFieldProps)}
        />
      ) : (
        <input
          id={fieldId}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...(props as InputFieldProps)}
        />
      )}
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="mt-1.5 text-sm text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 text-sm text-red-600 flex items-center">
          <svg className="mr-1.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

