/**
 * Servicio utilitario para orquestar los principios de "Naming Convention".
 * Aplica estándares operativos (Ej. <proyecto>-<ambiente>-<nombre>) consistentemente 
 * a través de etiquetas, nombres lógicos y nombres físicos en la nube.
 */
export class NamingService {
    constructor(
        private readonly project: string,
        private readonly environment: string
    ) { }

    /**
     * Construye un nombre físico usando el patrón estándar DevOps en formato Kebab-Case.
     * Ideal para asgnaciones nativas como 'vpcName' o 'securityGroupName'.
     * @param resourceIdentifier Ejemplo: 'vpc' -> retorna 'poc-dev-vpc'
     */
    public getPhysicalName(resourceIdentifier: string): string {
        return `${this.project}-${this.environment}-${resourceIdentifier}`.toLowerCase();
    }

    /**
     * Construye un ID lógico seguro y universal para CloudFormation en formato PascalCase.
     * @param resourceIdentifier Ejemplo: 'vpc' -> retorna 'PocDevVpc'
     */
    public getLogicalId(resourceIdentifier: string): string {
        const raw = `${this.project}-${this.environment}-${resourceIdentifier}`;
        return raw.split('-')
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');
    }
}
