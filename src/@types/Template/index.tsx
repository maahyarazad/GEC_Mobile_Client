export interface ITemplate {
    id: string | number | undefined;
    title: string;
}

export interface ITemplateTable {
    id: string | number;
    title: string;
}

export interface IResponseTemplate {
    success: boolean;
    error?: string;
    message?: string;
    data?: ITemplate;
}

export interface IResponseTemplates {
    success: boolean;
    error?: string;
    message?: string;
    data?: ITemplate[];
}

export interface IResponseTemplateTableUpdate {
    success: boolean;
    error?: string;
    message?: string;
    data?: ITemplateTable;
}

export type TemplateServiceType = {
    createTemplate: (data: ITemplate) => Promise<IResponseTemplate>,
    editTemplate: (data: ITemplate) => Promise<IResponseTemplate>,
    fetchTemplate: (id: string) => Promise<IResponseTemplate>,
    fetchTemplates: () => Promise<IResponseTemplates>,
}