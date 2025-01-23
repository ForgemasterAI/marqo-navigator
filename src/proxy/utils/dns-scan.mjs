import dns from 'dns';
import { promisify } from 'util';

const lookup = promisify(dns.lookup);
const k8s_namespace = process.env.K8S_NAMESPACE || 'default';


const SERVICE_NAMES = {
    configserver: 'vespa-internal',
    admin: 'vespa-admin-server',
    feed: 'vespa-feed-server',
    query: 'vespa-query-server',
    content: 'vespa-content-server',
};

const NODE_PATTERNS = {
    configserver: `vespa-configserver-{i}.${SERVICE_NAMES.configserver}.${k8s_namespace}`,
    admin: `vespa-admin-server-{i}.${SERVICE_NAMES.admin}.${k8s_namespace}`,
    query: `vespa-query-server-{i}.${SERVICE_NAMES.query}.${k8s_namespace}`,
    content: `vespa-content-server-{i}.${SERVICE_NAMES.content}.${k8s_namespace}`,
    marqo: `marqo.${k8s_namespace}.svc.cluster.local`
};
const NODE_LIMITS = {
    configserver: Number(process.env.CONFIGSERVER_NODE_COUNT) || 3,
    admin: Number(process.env.ADMIN_NODE_COUNT) || 1,
    query: Number(process.env.QUERY_NODE_COUNT) || 1,
    content: Number(process.env.CONTENT_NODE_COUNT) || 3,
    marqo: Number(process.env.MARQO_NODE_COUNT) || 1
};

async function scanNodeType(pattern, maxNodes) {
    const lookupPromises = [];
    
    for (let i = 0; i < maxNodes; i++) {
        const hostname = pattern.replace('{i}', i);
        const promise = lookup(hostname)
            .then(() => ({
                hostname,
                status: 'alive',
                index: i
            }))
            .catch(error => ({
                hostname,
                status: 'not-reachable',
                error: error.code,
                index: i
            }));
        lookupPromises.push(promise);
    }
    
    return Promise.all(lookupPromises);
}

export async function scanCluster() {
    try {
        const results = {};
        for (const [nodeType, pattern] of Object.entries(NODE_PATTERNS)) {
            const nodeResults = await scanNodeType(pattern, NODE_LIMITS[nodeType]);
            results[nodeType] = nodeResults.sort((a, b) => a.index - b.index);
        }
        
        return results;
    } catch (error) {
        console.error('Cluster scan failed:', error);
        return {};
    }
}

export const vespaScanService = async (req, res) => {
    const results = await scanCluster();
    res.set('Content-Type', 'application/json');
    res.json(results);
}   