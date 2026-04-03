import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BaseNetwork } from './constructs/base-network';
import { NamingService } from './utils/naming-service';
import { PocAwsCdkStackProps } from './interfaces/poc-aws-cdk-stack.interface';

/**
 * Pila Principal del Stack
 */
export class PocAwsCdkStack extends cdk.Stack {
  public readonly network: BaseNetwork;

  constructor(scope: Construct, id: string, props?: PocAwsCdkStackProps) {
    super(scope, id, props);

    if (!props?.vpcCidr || !props?.subnetCidrMask || !props?.maxAzs || props?.enableNatGateways === undefined || !props?.projectName || !props?.environment) {
      throw new Error('Missing required properties');
    }

    const {
      projectName,
      environment,
      vpcCidr,
      subnetCidrMask,
      maxAzs,
      enableNatGateways
    } = props;

    // Instanciacion de utilitario estándar de Nombres AWS DevOps
    const namingService = new NamingService(projectName, environment);

    this.network = new BaseNetwork(this, namingService.getLogicalId('network-tier'), {
      vpcCidr,
      subnetCidrMask,
      maxAzs,
      enableNatGateways,
      namingService
    });
  }
}
