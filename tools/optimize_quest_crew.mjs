import {NodeIO} from '@gltf-transform/core';
import {prune,dedup,resample,weld,join} from '@gltf-transform/functions';
import fs from 'node:fs/promises';
const input=process.argv[2],output=process.argv[3];
const io=new NodeIO();const report=[];
for(const key of ['walking','budgeting','sleep','nutrition','teeth','household','meditation','gratitude','good_deed','screen_time','workout','discipline']){
 const doc=await io.read(`${input}/${key}.glb`);await doc.transform(resample(),dedup(),weld(),prune({keepExtras:true}));if(key!=='walking')await doc.transform(join({keepNamed:false}),prune({keepExtras:true}));const bytes=await io.writeBinary(doc);await fs.writeFile(`${output}/${key}.b64`,Buffer.from(bytes).toString('base64'));
 report.push({key,bytes:bytes.length,triangles:doc.getRoot().listMeshes().reduce((n,m)=>n+m.listPrimitives().reduce((n,p)=>n+(p.getIndices()?.getCount()||0)/3,0),0),skins:doc.getRoot().listSkins().length,clips:doc.getRoot().listAnimations().map(a=>a.getName())});
}
await fs.writeFile(`${output}/manifest.json`,JSON.stringify({generator:'ChatGPT original Blender sculptures, glTF Transform optimized',version:1,models:report},null,2));console.log(JSON.stringify(report,null,2));
