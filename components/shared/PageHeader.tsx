import type { ReactNode } from "react";

interface PageHeaderProps {
  pageTitle: string;
  pageDes: string;
  actions?: ReactNode;
}

const PageHeader = ({ pageTitle, pageDes, actions }: PageHeaderProps) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {pageTitle}
        </h1>
        <p className="text-muted-foreground">{pageDes}</p>
      </div>

      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
};

export default PageHeader;
