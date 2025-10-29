import React from 'react'

interface FormButtonProps {
    type: 'submit' | 'button' | 'reset';
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    loading?: boolean;
    disabled?: boolean;
    className?: string;
    children: React.ReactNode;
}

function FormButton({ type, onClick, loading, disabled = false, className = '', children }: FormButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`btn ${className}`}
        >
            {loading && (<span className="loading loading-spinner loading-sm"></span>)}
            {children}
        </button>
    )
}

function FormButtonContainer({ children }: { children: React.ReactNode }) {
    return (
        <div className="form-item space-x-2">
            {children}
        </div>
    )
    // return (
    //     <div>
    //         <FormButton type="submit">Submit</FormButton>
    //         <FormButton type="button" onClick={() => console.log('Button clicked!')}>Click Me</FormButton>
    //         <FormButton type="reset" loading>Loading...</FormButton>
    //     </div>
    // );
}

const FormButtonCompound = Object.assign(FormButton, {
    Container: FormButtonContainer,
});
export default FormButtonCompound;