import debounce from "debounce";
import { IFrameNavigator } from "../../navigator/IFrameNavigator";
export default class SampleReadEventHandler {
    navigator: IFrameNavigator;
    constructor(navigator: IFrameNavigator);
    enforceSampleRead: debounce.DebouncedFunction<(position: any) => void>;
}
