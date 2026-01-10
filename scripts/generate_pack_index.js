const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const DIST_FOLDER = './Dist/Packs';
const OUTPUT_FILE = './pack_index.json';

async function scanZipFile(zipPath, relativePath) {
    try {
        const zipData = fs.readFileSync(zipPath);
        const zip = await JSZip.loadAsync(zipData);
        
        const pngFiles = [];
        Object.keys(zip.files).forEach(filename => {
            if (filename.toLowerCase().endsWith('.png')) {
                const name = filename.split('/').pop().replace('.png', '');
                pngFiles.push(name);
            }
        });
        
        return {
            path: relativePath,
            name: path.basename(zipPath),
            pngFiles: pngFiles
        };
    } catch (error) {
        console.error(`Error processing ${zipPath}:`, error.message);
        return null;
    }
}

async function scanDirectory(dir, baseDir = dir) {
    const results = [];
    
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                const subResults = await scanDirectory(fullPath, baseDir);
                results.push(...subResults);
            } else if (item.name.toLowerCase().endsWith('.zip')) {
                const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
                const packInfo = await scanZipFile(fullPath, relativePath);
                if (packInfo) {
                    results.push(packInfo);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dir}:`, error.message);
    }
    
    return results;
}

async function generateIndex() {
    console.log('Scanning packs...');
    
    if (!fs.existsSync(DIST_FOLDER)) {
        console.error(`Folder not found: ${DIST_FOLDER}`);
        process.exit(1);
    }
    
    const packs = await scanDirectory(DIST_FOLDER);
    
    const index = {
        generatedAt: new Date().toISOString(),
        totalPacks: packs.length,
        packs: packs
    };
    
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));
    
    console.log(`Generated index with ${packs.length} packs`);
    console.log(`Saved to: ${OUTPUT_FILE}`);
}

generateIndex().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
