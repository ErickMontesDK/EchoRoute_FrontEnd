interface ModalProps {
    title: string;
    message: string;
    buttonText1: React.ReactNode;
    buttonText2: React.ReactNode;
    buttonAction1: () => void;
    buttonAction2: () => void;
    icon?: React.ReactNode | null;
    children?: React.ReactNode | null;
    isVertical?: boolean;
    isForm?: boolean;
    isSubmitDisabled?: boolean;
    showCloseButton?: boolean;
}

export default function Modal({
    title,
    message,
    buttonText1,
    buttonText2,
    buttonAction1,
    buttonAction2,
    icon,
    children,
    isVertical = false,
    isForm = false,
    isSubmitDisabled = false,
    showCloseButton = false
}: ModalProps) {
    const handleFormSubmit = (e: React.FormEvent) => {
        if (isForm) {
            e.preventDefault();
            buttonAction1();
        }
    };

    const Buttons = () => (
        <div className={`d-flex ${isVertical ? 'flex-column' : 'flex-row mt-4'} justify-content-center gap-2`}>
            <button
                id={isForm ? "submit-button" : ""}
                type={isForm ? "submit" : "button"}
                disabled={isSubmitDisabled}
                className="btn btn-primary btn-md fw-bold d-flex align-items-center justify-content-center py-3"
                style={{ borderRadius: '12px' }}
                onClick={!isForm ? buttonAction1 : undefined}
            >
                {buttonText1}
            </button>
            {buttonText2 &&
                <button
                    id={isForm ? "cancel-button" : ""}
                    type="button"
                    className="btn btn-outline-secondary btn-lg fw-bold d-flex align-items-center justify-content-center py-3"
                    style={{ borderRadius: '12px' }}
                    onClick={buttonAction2}
                >
                    {buttonText2}
                </button>
            }
        </div>
    );

    return (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '700px' }}>
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    {showCloseButton && (
                        <button
                            type="button"
                            className="btn-close position-absolute"
                            style={{ top: '1.25rem', right: '1.25rem', zIndex: 1 }}
                            onClick={buttonAction2}
                        />
                    )}


                    <div className="modal-body p-5 text-center">
                        {icon &&
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: 'var(--success-subtle)', borderRadius: '50%', color: 'var(--success-color)' }}>
                                {icon}
                            </div>
                        }
                        <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.025em' }}>{title}</h2>
                        <p className="text-muted mb-4">
                            {message}
                        </p>

                        {isForm ? (
                            <form onSubmit={handleFormSubmit}>
                                {children}
                                <Buttons />
                            </form>
                        ) : (
                            <>
                                {children}
                                <Buttons />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}