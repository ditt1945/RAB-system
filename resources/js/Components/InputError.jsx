export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-sale ' + className}
        >
            {message}
        </p>
    ) : null;
}
