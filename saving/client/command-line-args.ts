export interface CliArg {
    name: string;
    value: string | null;
    defaultValues: string[];
}

export interface CliCommand {
    name: string;
    params: CliArg[];
}
