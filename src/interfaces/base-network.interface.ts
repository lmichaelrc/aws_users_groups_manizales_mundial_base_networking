import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { NamingService } from '../utils/naming-service';

/**
 * Propiedades de configuración para inicializar la topología de red base.
 */
export interface BaseNetworkProps {
    readonly vpcCidr: string;
    readonly subnetCidrMask: number;
    readonly maxAzs: number;
    readonly enableNatGateways: boolean;
    readonly namingService: NamingService;
}

/**
 * Define la estructura para declarar objetos de reglas individuales destinadas
 * a los ACLs (Access Control Lists) de la red.
 */
export interface NaclRuleDefinition {
    readonly id: string;
    readonly ruleNumber: number;
    readonly action: ec2.Action;
    readonly direction: ec2.TrafficDirection;
    readonly cidr: ec2.AclCidr;
    readonly traffic: ec2.AclTraffic;
}
