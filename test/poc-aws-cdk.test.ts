import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import * as PocAwsCdk from '../src/poc-aws-cdk-stack';

describe('PocAwsCdkStack Networking Base', () => {
    let app: cdk.App;
    let stack: PocAwsCdk.PocAwsCdkStack;
    let template: Template;

    beforeEach(() => {
        app = new cdk.App();
        stack = new PocAwsCdk.PocAwsCdkStack(app, 'MyTestStack', {
            projectName: 'testpoc',
            environment: 'unit',
            vpcCidr: '10.0.0.0/16',
            subnetCidrMask: 24,
            maxAzs: 2,
            enableNatGateways: false
        });
        template = Template.fromStack(stack);
    });

    test('Creates a VPC with correct CIDR and dynamic Naming Convention Name', () => {
        template.hasResourceProperties('AWS::EC2::VPC', {
            CidrBlock: '10.0.0.0/16',
            EnableDnsHostnames: true,
            EnableDnsSupport: true,
            Tags: Match.arrayWith([
                Match.objectLike({
                    Key: 'Name',
                    Value: 'testpoc-unit-vpc'
                })
            ])
        });
    });

    test('No NAT Gateways are created by default (Cost Optimization)', () => {
        template.resourceCountIs('AWS::EC2::NatGateway', 0);
    });

    test('Creates exactly 2 Public and 2 Private Subnets', () => {
        template.resourceCountIs('AWS::EC2::Subnet', 4);
        template.hasResourceProperties('AWS::EC2::Subnet', { MapPublicIpOnLaunch: false });
        template.hasResourceProperties('AWS::EC2::Subnet', { MapPublicIpOnLaunch: true });
    });

    test('Creates Base Application Security Group with compliant Name', () => {
        template.hasResourceProperties('AWS::EC2::SecurityGroup', {
            GroupDescription: 'Grupo de seguridad perimetral base para los recursos aplicacionales',
            GroupName: 'testpoc-unit-base-app-sg',
            SecurityGroupIngress: Match.arrayWith([
                Match.objectLike({ CidrIp: '10.0.0.0/16', IpProtocol: '-1' })
            ])
        });
    });

    test('Creates Network ACLs', () => {
        template.resourceCountIs('AWS::EC2::NetworkAcl', 2);
    });
});
