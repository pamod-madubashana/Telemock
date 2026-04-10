import appIcon from "../../../src-tauri/icons/icon.png";

export function LoadingScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.2),_transparent_40%),radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.16),_transparent_32%)]" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <img
          src={appIcon}
          alt="Telemock"
          className="mb-5 h-32 w-32 rounded-[30px] object-cover shadow-[0_20px_60px_hsl(var(--primary)/0.24)] animate-pulse sm:h-36 sm:w-36"
        />
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Telemock
        </h1>
      </div>
    </div>
  );
}
