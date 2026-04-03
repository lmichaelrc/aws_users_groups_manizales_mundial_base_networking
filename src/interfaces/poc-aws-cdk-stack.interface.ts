import * as cdk from 'aws-cdk-lib';

/**
 * Interfaz que dicta qué clase de variables externas son admisibles 
 * al momento de sintetizar y desplegar la pila.
 */
export interface PocAwsCdkStackProps extends cdk.StackProps {
    readonly projectName?: string;
    readonly environment?: string;
    readonly vpcCidr?: string;
    readonly subnetCidrMask?: number;
    readonly maxAzs?: number;
    readonly enableNatGateways?: boolean;
}
