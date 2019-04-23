from fabric.api import * 
from fabric.api import local,cd,run,env
from os import listdir
from os.path import isfile, join
import pexpect, sys, json
#!/usr/local/bin/python3.7
# encoding: utf-8
 
#aws_host_list = ['13.238.154.172', '13.210.167.55', '13.236.44.25']
# aws_host_list = ['13.210.167.55', '13.236.44.25']
# ali_host_list = []
vmware_host = ['192.168.184.130']

# Generate a complicated password from: https://passwordsgenerator.net

signer_password = 'password'
prefunding_password = 'aWFe7v%S!-rKu!6y'
vmware_password = 'Gaucon@0501'

env.password='Asdf1234!@'
env.roledefs = {
    # 'ALIserver': ['root@' + host for host in ali_host_list],
    # 'AWSserver': ['ubuntu@' + host for host in aws_host_list],
    'vmware': ['cuongbui@' + host for host in vmware_host]
}

###########################################
###          Global definition          ###
###########################################

##For artChainGlobal demo 
#NODEFOLDER = 'webdemonode'
#CHAINID = 7549
#CHAINPORT = 3124
#CHAINCONNECTPORT = 33000
#CLIENTAPP = 'geth'
#LOGFILE = 'webdemonode.log'

## For webteam test
# NODEFOLDER = 'acgnode'
# CHAINID = 1614
# CHAINPORT = 3000
# CHAINCONNECTPORT = 28740
# CLIENTAPP = 'ggeth'
# LOGFILE = 'acgnode.log'

# FOR VMWARE NODE
NODEFOLDER = 'testnode'
CHAINID = 1614
CHAINPORT = 3000
CHAINCONNECTPORT = 28740
CLIENTAPP = 'ggeth'
LOGFILE = 'testnode.log'

# @roles('ALIserver', 'AWSserver')
@roles('vmware')
@parallel
def cleanEnv():
    local('rm -rf address.*')
    local('rm -rf tmp.*')
    local('rm -rf static-nodes.json genesislin.json')
    local('rm -rf ' + env.host)
    local('mkdir ' + env.host)
    run(f'killall {CLIENTAPP}; sleep 0.5')
    with cd('~'):
        run(f'rm -rf address* nohup.sh genesis*.json enode* {LOGFILE} IP.txt 06_console.sh 09_nohup.sh IP.txt address*')
        run('rm -rf enode* tmp*')
        run(f'rm -rf {NODEFOLDER}')
# @roles('ALIserver', 'AWSserver')
@roles('vmware')
@parallel
def createSignerAccount():
    with cd('~'):   #cd to home dir
        node_cmd = f'{CLIENTAPP} --datadir {NODEFOLDER} account new --password <(echo {signer_password}) 2> /dev/null'
        result = run(node_cmd + '| grep Address | sed "s/Address:\ {//g"| sed "s/}$//g"')
        local('echo ' + result + ' > ./signer_address.' + env.host)
    get(f'~/{NODEFOLDER}/keystore/UTC*', env.host+'/signer_keystore.json')

# @roles('ALIserver', 'AWSserver')
@roles('vmware')
@parallel
def createPrefundingAccount():
    with cd('~'):   #cd用于进入某个目录
        node_cmd = f'{CLIENTAPP} --datadir {NODEFOLDER} account new --password <(echo {prefunding_password}) 2> /dev/null'
        result = run(node_cmd + '| grep Address | sed "s/Address:\ {//g"| sed "s/}$//g"')
        local('echo ' + result + ' > ./prefunding_address.' + env.host)
    get(f'~/{NODEFOLDER}/keystore/UTC*', env.host+'/prefunding_keystore.json')

# @roles('ALIserver', 'AWSserver')  
@roles('vmware')
@parallel
def generateSingleNodeFile():
    put('./genesislin.json', '~/')
    with cd('~'):   
        run(f'killall {CLIENTAPP}; sleep 0.5')
        run(f'{CLIENTAPP} --datadir ~/{NODEFOLDER} init genesislin.json')
        remote_command = f'{CLIENTAPP} --datadir ~/{NODEFOLDER} --networkid {CHAINID} --port {CHAINPORT} js <(echo "console.log(admin.nodeInfo.enode);") 2> /dev/null | grep enode | perl -pe \"s/\[\:\:\]/' + env.host + '/g\" | perl -pe \"s/^/\\\\"/; s/\s*$/\\\\"/;\" | tee tmp.' + env.host
        enodestring = run(remote_command)
        get('~/tmp.*', '.')

# @roles('ALIserver', 'AWSserver')
@roles('vmware')
#@parallel
def launchChainClient():
    with cd('~'): 
        run(f'echo {signer_password} > ~/{NODEFOLDER}/unlock_file')
        run(f'killall {CLIENTAPP}; sleep 0.5')
        # Command for my personal test
        # launch_cmd = '(nohup geth --datadir ~/acgnode0 --port 3000 --nodiscover --unlock "0" --password ~/acgnode0/unlock_file --targetgaslimit 4294967295 --rpc --rpcaddr "0.0.0.0" --rpcport 42000 --rpccorsdomain "*" --rpcapi "db,web3,eth,net,admin,personal" --ws --wsaddr "0.0.0.0" --wsport 42001 --wsorigins "*" --wsapi "db,web3,eth,net,admin,personal,txpool" --mine --syncmode "full" --gcmode archive --txpool.lifetime 24h --txpool.accountslots 65536 --txpool.globalslots 65536 --txpool.accountqueue 64 --txpool.globalqueue 65536 &> ethacgnode0.log 2>&1 &) && sleep 2'
        # Command for web team test
        CHAINRPCPORT = CHAINCONNECTPORT 
        CHAINWSPORT = CHAINCONNECTPORT + 10000
        unlocked_account = local('cat signer_address.' + env.host, capture=True)

        launch_cmd = f'(nohup {CLIENTAPP} --datadir ~/{NODEFOLDER} --networkid {CHAINID} --port {CHAINPORT} --nodiscover --unlock {unlocked_account} --password ~/{NODEFOLDER}/unlock_file --rpc --rpcaddr "0.0.0.0" --rpcport {CHAINRPCPORT} --rpcapi "web3,net,eth,personal" --mine --gasprice "0" --syncmode "full" --gcmode archive --txpool.lifetime 24h --txpool.accountslots 65536 --txpool.globalslots 65536 --txpool.accountqueue 64 --txpool.globalqueue 65536 &> {LOGFILE} 2>&1 &) && sleep 2'
        run(launch_cmd)
        #run(f'rm -rf ~/{NODEFOLDER}/unlock_file')

# @roles('ALIserver', 'AWSserver')
@roles('vmware')
@parallel
def uploadStaticNodeAndClientLaunchScript():
    put('./static-nodes.json', f'~/{NODEFOLDER}')

@roles('ALIserver', 'AWSserver')
@parallel
def setServerSwap():
    run('sudo swapoff -a; sleep 1')
    run('sudo rm -f /swapfile')
    run('sudo fallocate -l 2G /swapfile')
    run('sudo chmod 600 /swapfile')
    run('sudo mkswap /swapfile')
    run('sudo swapon /swapfile; sleep 1')

def generateStaticNodeFile():
    files = [f for f in listdir(".") if isfile(join(".", f)) and "tmp" in f]
    static_node_string = "["
    for f in files:
        with open(f, 'r') as single_node:
            static_node_string += single_node.read() + ','
    static_node_string = static_node_string[:-1] + "]"
    with open('static-nodes.json','w') as node_file:
        node_file.write(static_node_string)

# @roles('ALIserver', 'AWSserver')
@roles('vmware')
@parallel
def testAction():
    #testresult = run('cd ~; ls -l');
    #print(testresult)
    #run('echo ' + env.host)
    #local('echo ' + env.host)
    print(env.host)
    print(len(env.host))

# @roles('AWSserver')
@roles('vmware')
#@runs_once
def testLocalAction():
    cmd = 'cat ' + 'address.' + env.host 
    address = local(cmd, capture=True)

def generate_deploy_conf():
    # user first AWS as access point of the chain
    rpc_address = f'http://{vmware_host[0]}:{CHAINCONNECTPORT}'
    admin = local(f'cat prefunding_address.{vmware_host[0]}', capture=True)
    password = vmware_password
    deploy_conf = {'server':rpc_address, 'administrator':admin, 'password':password}

    with open('deployConf.json', 'w') as outfile:
        json.dump(deploy_conf, outfile)

    local(f'mv ./{vmware_host[0]}/prefunding_keystore.json account_keystore_admin.json')

def generate_genesis_file():
    #proc_gen = pexpect.spawn('puppeth --network testnet', encoding='utf-8', logfile=sys.stdout)
    proc_gen = pexpect.spawn('puppeth --network testnet', encoding='utf-8')
    proc_gen.logfile_read = sys.stdout

    match_order = proc_gen.expect(['Configure new genesis', 'Manage existing genesis'])
    if match_order == 0:
        #What would you like to do? (default = stats)
        # 1. Show network stats
        # 2. Configure new genesis
        # 3. Track new remote server
        # 4. Deploy network components
        #> 
        proc_gen.sendline("2") # 2. Manage existing genesis
    elif match_order == 1:
        #What would you like to do? (default = stats)
        # 1. Show network stats
        # 2. Manage existing genesis
        # 3. Track new remote server
        # 4. Deploy network components
        #> 
        proc_gen.sendline("2") # 2. Manage existing genesis

        # 1. Modify existing fork rules
        # 2. Export genesis configuration
        # 3. Remove genesis configuration
        #>
        proc_gen.expect('> ')
        proc_gen.sendline("3")

        #What would you like to do? (default = stats)
        # 1. Show network stats
        # 2. Configure new genesis
        # 3. Track new remote server
        # 4. Deploy network components
        #> 
        proc_gen.expect('> ')
        proc_gen.sendline("2")

    #Which consensus engine to use? (default = clique)
    # 1. Ethash - proof-of-work
    # 2. Clique - proof-of-authority
    #> 
    proc_gen.expect('> ')
    proc_gen.sendline("2")

    #How many seconds should blocks take? (default = 15)
    #> 
    proc_gen.expect('> ')
    proc_gen.sendline("0")

    #Which accounts are allowed to seal? (mandatory at least one)
    #> 0x
    for host in vmware_host:
        proc_gen.expect('0x')
        file_name = 'signer_address.' + host
        with open(file_name, 'r') as address_file:
            account_address = address_file.read().rstrip()
            proc_gen.sendline(account_address)
    #> 0x
    proc_gen.expect('0x')
    proc_gen.sendline("")

    ##Which accounts should be pre-funded? (advisable at least one)
    #for host in aws_host_list:
        #proc_gen.expect('0x')
        #file_name = 'prefunding_address.' + host
        #with open(file_name, 'r') as address_file:
            #account_address = address_file.read().rstrip()
            #proc_gen.sendline(account_address)
    
    #> 0x
    proc_gen.expect('0x')
    proc_gen.sendline("")

    #Specify your chain/network ID if you want an explicit one (default = random)
    #> 
    proc_gen.expect('> ')
    proc_gen.sendline(f"{CHAINID}")

    #What would you like to do? (default = stats)
    #1. Show network stats
    #2. Manage existing genesis
    #3. Track new remote server
    #4. Deploy network components
    #> 
    proc_gen.expect('> ')
    proc_gen.sendline("2")

    # 1. Modify existing fork rules
    # 2. Export genesis configuration
    # 3. Remove genesis configuration
    #>
    proc_gen.expect('> ')
    proc_gen.sendline("2")

    #Which file to save the genesis into? (default = testnet.json)
    #> 
    proc_gen.expect('> ')
    proc_gen.sendline("genesislin.json")

    #What would you like to do? (default = stats)
    # 1. Show network stats
    # 2. Manage existing genesis
    # 3. Track new remote server
    # 4. Deploy network components
    #> 
    proc_gen.expect('> ')
    proc_gen.close()

    # replace default gas limit
    with open('genesislin.json', 'r') as file :
        filedata = file.read()
    # Replace the target string
    filedata = filedata.replace('47b760', 'ffffffff')
    # Write the file out again
    with open('genesislin.json', 'w') as file:
        file.write(filedata)

def dotask():
    execute(cleanEnv)
    execute(createSignerAccount)
    execute(createPrefundingAccount)
    generate_genesis_file()
    execute(generateSingleNodeFile)
    generateStaticNodeFile()
    execute(uploadStaticNodeAndClientLaunchScript)
    execute(launchChainClient)
    generate_deploy_conf()

def launchChain():
    execute(launchChainClient)

def setupSwap():
    execute(setServerSwap)

def testTask():
    testAction()

def testLocal():
    generate_deploy_conf()
    #execute(testLocalAction)

def cleanAll():
    execute(cleanEnv)