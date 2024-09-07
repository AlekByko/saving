export function kMeans(data: number[][], k: number, maxIterations = 100) {
    const numPoints = data.length;
    const numFeatures = data[0].length;

    // Initialize centroids randomly
    function initializeCentroids(): number[][] {
        const centroids: number[][] = [];
        const usedIndices = new Set();
        while (centroids.length < k) {
            const index = Math.floor(Math.random() * numPoints);
            if (usedIndices.has(index)) continue;
            usedIndices.add(index);
            centroids.push(data[index]);
        }
        return centroids;
    }

    // Calculate Euclidean distance between two vectors
    function euclideanDistance(a: number[], b: number[]) {
        let sum = 0;
        for (let i = 0; i < numFeatures; i++) {
            sum += (a[i] - b[i]) ** 2;
        }
        return Math.sqrt(sum);
    }

    // Assign points to the nearest centroid
    function assignClusters(centroids: number[][]) {
        const clusters: number[][][] = Array(k).fill([]);
        data.forEach(point => {
            let minDistance = Infinity;
            let closestCentroid = -1;
            centroids.forEach((centroid, index) => {
                const distance = euclideanDistance(point, centroid);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestCentroid = index;
                }
            });
            clusters[closestCentroid].push(point);
        });
        return clusters;
    }

    // Update centroids based on cluster means
    function updateCentroids(clusters: number[][][]) {
        return clusters.map(cluster => {
            const newCentroid = Array(numFeatures).fill(0);
            if (cluster.length === 0) return newCentroid; // Avoid division by zero
            cluster.forEach(point => {
                for (let i = 0; i < numFeatures; i++) {
                    newCentroid[i] += point[i];
                }
            });
            for (let i = 0; i < numFeatures; i++) {
                newCentroid[i] /= cluster.length;
            }
            return newCentroid;
        });
    }

    // Main K-means loop
    let centroids = initializeCentroids();
    let clusters: number[][][] = [];
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        clusters = assignClusters(centroids);
        const newCentroids = updateCentroids(clusters);
        if (newCentroids.every((c, i) => euclideanDistance(c, centroids[i]) < 1e-6)) {
            break; // Convergence
        }
        centroids = newCentroids;
    }

    return { centroids, clusters };
}

// Example usage:
const data = [
    [1.0, 2.0], [1.5, 1.8], [5.0, 8.0], [8.0, 8.0],
    [1.0, 0.6], [9.0, 11.0], [8.0, 2.0], [10.0, 2.0],
    [9.0, 3.0]
];
const k = 3;
const result = kMeans(data, k);
console.log('Centroids:', result.centroids);
console.log('Clusters:', result.clusters);
