export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-7 shadow-panel backdrop-blur">
      <div className="pointer-events-none absolute" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-200">{eyebrow}</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">{description}</p>
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
    </section>
  );
}
