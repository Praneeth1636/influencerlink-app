export default function AppLoading() {
  return (
    <main className="min-h-screen bg-white px-5 py-8 font-sans text-[#37352f]">
      <div className="mx-auto grid max-w-[1180px] gap-6">
        <header className="flex items-center justify-between border-b border-[#ededec] pb-6">
          <div>
            <div className="h-3 w-28 rounded-full bg-[#eceef2]" />
            <div className="mt-3 h-8 w-52 rounded-full bg-[#f2f3f5]" />
          </div>
          <div className="hidden h-9 w-32 rounded-full bg-[#f2f3f5] sm:block" />
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="rounded-xl border border-[#e9e9e7] bg-white p-5" key={index}>
              <div className="h-3 w-24 rounded-full bg-[#eceef2]" />
              <div className="mt-4 h-8 w-16 rounded-full bg-[#f2f3f5]" />
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div className="rounded-xl border border-[#e9e9e7] bg-white p-5" key={index}>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#faf0ea]" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-44 rounded-full bg-[#eceef2]" />
                    <div className="mt-3 h-3 w-full max-w-md rounded-full bg-[#f2f3f5]" />
                    <div className="mt-2 h-3 w-3/5 rounded-full bg-[#f2f3f5]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden rounded-xl border border-[#e9e9e7] bg-white p-5 lg:block">
            <div className="h-4 w-32 rounded-full bg-[#eceef2]" />
            <div className="mt-5 grid gap-3">
              <div className="h-14 rounded-lg bg-[#f7f8fa]" />
              <div className="h-14 rounded-lg bg-[#f7f8fa]" />
              <div className="h-14 rounded-lg bg-[#f7f8fa]" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
