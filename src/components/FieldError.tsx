/** Inline required-field validation message rendered in #EF4444 red. */
const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
      {message}
    </p>
  );
};

export default FieldError;
