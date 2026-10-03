const PageWrapper = ({ children }) => {
  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {children}
    </main>
  );
};

export default PageWrapper;
