
type FunctionResult<T> = Promise<{ data: T }>;
type FunctionType<TArg, TResult> = (data: TArg) => FunctionResult<TResult>;

type FunctionsMemoryOptions = '128MB' | '256MB' | '512MB' | '1GB' | '2GB';

type Converter<T1, T2> = (a: T1) => T2;

export class FunctionDefinition<TArg, TResult> {
    readonly Function: FunctionType<TArg, TResult> = null;

    readonly Arg: TArg = null;
    readonly Result: TResult = null;

    readonly FullName: string;

    private _argProcessor: (arg: TArg) => any = a => a;
    private _resultProcessor: (result: any) => TResult = r => r as TResult;

    public get ArgProrcessor() { return this._argProcessor; }
    public get ResultProcessor() { return this._resultProcessor; }

    constructor(
        readonly Name: string,
        readonly Namespace: string = '',
        readonly Timeout = 60,
        readonly Memory: FunctionsMemoryOptions = '256MB',
    ) {
        this.FullName = this.Namespace
            ? `${this.Namespace}-${this.Name}`
            : this.Name;
    }

    public specify<TArg2, TResult2 = TResult>(
        argConverter?: Converter<TArg2, TArg>,
        resConverter?: Converter<TResult, TResult2>,
    ): FunctionDefinition<TArg2, TResult2> {
        return new FunctionDefinition<TArg2, TResult2>(this.Name, this.Namespace, this.Timeout, this.Memory)
            .addArgProcessor(argConverter)
            .addResultProcessor(resConverter);
    }

    public addArgProcessor(processArg: (arg: TArg) => any) {
        if (processArg) {
            this._argProcessor = processArg;
        }
        return this;
    }

    public addResultProcessor(processRes: (res: any) => TResult) {
        if (processRes) {
            this._resultProcessor = processRes;
        }
        return this;
    }
}
