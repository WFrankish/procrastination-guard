interface IBackground {
    readonly storage: IStorage;
    readonly isRunning: boolean;

    shouldBlock(detail: Detail): browser.webRequest.BlockingResponse;
    startWorkMode(): void;
    endWorkMode(): void;
}

type Detail = {
    // also some other stuff
    url: string
}