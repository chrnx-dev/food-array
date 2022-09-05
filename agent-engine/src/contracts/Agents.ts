export default abstract class AgentContract {
    async percept(): Promise<any> { throw new Error("Method not implemented."); }
    async reaction(): Promise<any> { throw new Error("Method not implemented."); }
    async resolve(): Promise<any> { throw new Error("Method not implemented."); }
}