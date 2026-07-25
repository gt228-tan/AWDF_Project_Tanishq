function ErrorMessage({ message }) {
  return (
    <div
      style={{
        padding: "16px 24px",
        margin: "24px auto",
        maxWidth: 600,
        borderRadius: 8,
        background: "rgba(220, 38, 38, 0.1)",
        border: "1px solid rgba(220, 38, 38, 0.4)",
        color: "#dc2626",
        textAlign: "center",
      }}
    >
      <strong>Error:</strong> {message}
    </div>
  );
}

export default ErrorMessage;
