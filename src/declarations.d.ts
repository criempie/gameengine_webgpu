// So that typescript doesn't swear when importing wsdl files
declare module "*?raw"
{
    const content: string;
    export default content;
}