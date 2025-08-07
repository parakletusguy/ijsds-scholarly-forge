import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export interface ValidationRule {
  field: string;
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: number | string | RegExp;
  message: string;
  customValidator?: (value: any) => boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface FormValidationProps {
  data: Record<string, any>;
  rules: ValidationRule[];
  onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void;
  showSummary?: boolean;
  showFieldIndicators?: boolean;
}

export const FormValidation = ({
  data,
  rules,
  onValidationChange,
  showSummary = true,
  showFieldIndicators = true
}: FormValidationProps) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const newErrors: ValidationError[] = [];

    rules.forEach(rule => {
      const value = data[rule.field];
      let hasError = false;

      switch (rule.type) {
        case 'required':
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            hasError = true;
          }
          break;

        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            hasError = true;
          }
          break;

        case 'minLength':
          if (value && typeof value === 'string' && value.length < (rule.value as number)) {
            hasError = true;
          }
          break;

        case 'maxLength':
          if (value && typeof value === 'string' && value.length > (rule.value as number)) {
            hasError = true;
          }
          break;

        case 'pattern':
          if (value && !(rule.value as RegExp).test(value)) {
            hasError = true;
          }
          break;

        case 'custom':
          if (rule.customValidator && !rule.customValidator(value)) {
            hasError = true;
          }
          break;
      }

      if (hasError) {
        newErrors.push({
          field: rule.field,
          message: rule.message,
          type: 'error'
        });
      }
    });

    setErrors(newErrors);
    const formIsValid = newErrors.length === 0;
    setIsValid(formIsValid);

    if (onValidationChange) {
      onValidationChange(formIsValid, newErrors);
    }
  }, [data, rules, onValidationChange]);

  const getFieldStatus = (fieldName: string) => {
    const fieldErrors = errors.filter(error => error.field === fieldName);
    if (fieldErrors.length > 0) return 'error';
    if (data[fieldName]) return 'success';
    return 'default';
  };

  const getFieldIcon = (fieldName: string) => {
    const status = getFieldStatus(fieldName);
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getFieldErrors = (fieldName: string) => {
    return errors.filter(error => error.field === fieldName);
  };

  if (!showSummary && !showFieldIndicators) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showSummary && errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {errors.map((error, index) => (
                  <li key={index}>{error.message}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showSummary && isValid && Object.keys(data).length > 0 && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Form validation passed. Ready to submit!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export const FieldValidationIndicator = ({ 
  fieldName, 
  errors 
}: { 
  fieldName: string;
  errors: ValidationError[];
}) => {
  const fieldErrors = errors.filter(error => error.field === fieldName);
  
  if (fieldErrors.length === 0) return null;

  return (
    <div className="mt-1 space-y-1">
      {fieldErrors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-destructive">
          <XCircle className="h-3 w-3" />
          <span>{error.message}</span>
        </div>
      ))}
    </div>
  );
};

export const ValidationStatus = ({ 
  isValid, 
  errorCount 
}: { 
  isValid: boolean;
  errorCount: number;
}) => {
  if (isValid) {
    return (
      <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
        <CheckCircle className="h-3 w-3 mr-1" />
        Valid
      </Badge>
    );
  }

  return (
    <Badge variant="destructive">
      <XCircle className="h-3 w-3 mr-1" />
      {errorCount} Error{errorCount !== 1 ? 's' : ''}
    </Badge>
  );
};