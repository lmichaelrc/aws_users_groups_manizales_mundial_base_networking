import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';
import { NamingService } from '../utils/naming-service';
import { BaseNetworkProps, NaclRuleDefinition } from '../interfaces/base-network.interface';

/**
 * Constructo modular encapsulable L3 responsable de levantar una Virtual Private Cloud
 * íntegra (VPC), aprovisionando topología multi-az (pública/privada), grupos de 
 * seguridad corporativos restrictivos y políticas subyacentes de NACL stateless.
 */
export class BaseNetwork extends Construct {
    /** Instancia física de la VPC resultante. */
    public readonly vpc: ec2.Vpc;

    /** Security group configurado como base para consumo interno de microservicios. */
    public readonly baseAppSecurityGroup: ec2.SecurityGroup;
    private readonly namingService: NamingService;

    constructor(scope: Construct, id: string, props: BaseNetworkProps) {
        super(scope, id);
        this.namingService = props.namingService;

        this.vpc = this.createVpc(props);
        this.baseAppSecurityGroup = this.createBaseSecurityGroup(props.vpcCidr);

        this.createPublicNacl();
        this.createPrivateNacl(props.enableNatGateways, props.vpcCidr);
        this.exportOutputs();
    }

    private createVpc(props: BaseNetworkProps): ec2.Vpc {
        return new ec2.Vpc(this, this.namingService.getLogicalId('vpc'), {
            vpcName: this.namingService.getPhysicalName('vpc'),
            ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
            maxAzs: props.maxAzs,
            enableDnsHostnames: true,
            enableDnsSupport: true,
            natGateways: props.enableNatGateways ? props.maxAzs : 0,
            subnetConfiguration: [
                {
                    cidrMask: props.subnetCidrMask,
                    name: 'public',
                    subnetType: ec2.SubnetType.PUBLIC,
                },
                {
                    cidrMask: props.subnetCidrMask,
                    name: 'private',
                    subnetType: props.enableNatGateways ? ec2.SubnetType.PRIVATE_WITH_EGRESS : ec2.SubnetType.PRIVATE_ISOLATED,
                }
            ]
        });
    }

    private createBaseSecurityGroup(vpcCidr: string): ec2.SecurityGroup {
        const baseSgId = this.namingService.getLogicalId('base-app-sg');
        const sg = new ec2.SecurityGroup(this, baseSgId, {
            securityGroupName: this.namingService.getPhysicalName('base-app-sg'),
            vpc: this.vpc,
            description: 'Grupo de seguridad perimetral base para los recursos aplicacionales',
            allowAllOutbound: true,
        });

        sg.addIngressRule(
            ec2.Peer.ipv4(vpcCidr),
            ec2.Port.allTraffic(),
            'Permite que el trafico viaje libremente de un nodo local a otro'
        );

        return sg;
    }

    private createPublicNacl(): void {
        const publicAcl = new ec2.NetworkAcl(this, this.namingService.getLogicalId('public-nacl'), {
            networkAclName: this.namingService.getPhysicalName('public-nacl'),
            vpc: this.vpc,
            subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
        });

        const rules: NaclRuleDefinition[] = [
            { id: 'AllowInboundHTTP', ruleNumber: 100, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.INGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.tcpPort(80) },
            { id: 'AllowInboundHTTPS', ruleNumber: 110, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.INGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.tcpPort(443) },
            { id: 'AllowInboundEphemeral', ruleNumber: 120, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.INGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.tcpPortRange(1024, 65535) },
            { id: 'AllowOutboundAll', ruleNumber: 100, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.EGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.allTraffic() }
        ];

        rules.forEach(rule => publicAcl.addEntry(this.namingService.getLogicalId(`public-nacl-rule-${rule.id}`), rule));
    }

    private createPrivateNacl(enableNatGateways: boolean, vpcCidr: string): void {
        const privateAcl = new ec2.NetworkAcl(this, this.namingService.getLogicalId('private-nacl'), {
            networkAclName: this.namingService.getPhysicalName('private-nacl'),
            vpc: this.vpc,
            subnetSelection: {
                subnets: this.vpc.selectSubnets({
                    subnetType: enableNatGateways ? ec2.SubnetType.PRIVATE_WITH_EGRESS : ec2.SubnetType.PRIVATE_ISOLATED
                }).subnets
            }
        });

        const rules: NaclRuleDefinition[] = [
            { id: 'AllowInboundVPC', ruleNumber: 100, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.INGRESS, cidr: ec2.AclCidr.ipv4(vpcCidr), traffic: ec2.AclTraffic.allTraffic() },
            { id: 'AllowInboundEphemeral', ruleNumber: 110, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.INGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.tcpPortRange(1024, 65535) },
            { id: 'AllowOutboundAll', ruleNumber: 100, action: ec2.Action.ALLOW, direction: ec2.TrafficDirection.EGRESS, cidr: ec2.AclCidr.anyIpv4(), traffic: ec2.AclTraffic.allTraffic() }
        ];

        rules.forEach(rule => privateAcl.addEntry(this.namingService.getLogicalId(`private-nacl-rule-${rule.id}`), rule));
    }

    private exportOutputs(): void {
        new cdk.CfnOutput(this, this.namingService.getLogicalId('vpc-id-output'), {
            value: this.vpc.vpcId,
            description: 'Identificador Fisico de la VPC central'
        });
        new cdk.CfnOutput(this, this.namingService.getLogicalId('base-sg-id-output'), {
            value: this.baseAppSecurityGroup.securityGroupId,
            description: 'Identificador del Security Group Base para compartir entre stacks'
        });
    }
}
