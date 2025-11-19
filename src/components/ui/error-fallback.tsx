type ErrorFallbackProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorFallback({
  title = "Something went wrong",
  message = "Please try again later",
  onRetry,
}: ErrorFallbackProps) {
  return (
    <div className="rounded-sm border border-stroke bg-white px-7.5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="mb-4 flex h-15 w-15 items-center justify-center rounded-full bg-meta-1/10">
          <svg
            className="fill-meta-1"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              fill="currentColor"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-black dark:text-white">
          {title}
        </p>
        <p className="mt-2 text-sm text-body">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
