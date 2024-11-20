import IPenpotReference from "./IPenpotReference";

export default interface IPluginMessage {
  type: string;
  data?: IPenpotReference[] | IPenpotReference;
  from?: "Origin" | "Target";
  extra?: unknown;
}
