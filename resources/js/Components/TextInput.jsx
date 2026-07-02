import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props },
    ref,
) {
    const localRef = useRef(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-md border border-hairlineSoft bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone focus:border-info focus:ring-2 focus:ring-info/15 ' +
                className
            }
            ref={localRef}
        />
    );
});
