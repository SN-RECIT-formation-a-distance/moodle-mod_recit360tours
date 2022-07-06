import packageJson from "../../package.json";

export class Options
{
    static appVersion(){ return packageJson.version; }

    static appTitle(){
        return "Activité RÉCIT | " + this.appVersion();
    }

    static getGateway(){
        return `${M.cfg.wwwroot}/mod/recit360tours/classes/WebApi.php`;
    }
    
}