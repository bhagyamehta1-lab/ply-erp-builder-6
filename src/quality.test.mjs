import test from 'node:test';
import assert from 'node:assert/strict';
export const DISPOSITIONS=Object.freeze(['accepted','rejected','rework','hold']);
export function evaluateMeasurement({value,min,max}) {
 if (![value,min,max].every(Number.isFinite)||min>max) throw new Error('Invalid quality measurement limits');
 return value>=min&&value<=max?'pass':'fail';
}
export function resolveDisposition(results) {
 if (!Array.isArray(results)||!results.length||results.some(r=>!['pass','fail'].includes(r))) throw new Error('Valid inspection results required');
 if (results.includes('fail')) return 'hold';
 return 'accepted';
}
export function validateDisposition(disposition,reviewerId) {
 if (!DISPOSITIONS.includes(disposition)) throw new Error('Unknown QC disposition');
 if (['accepted','rejected'].includes(disposition)&&!reviewerId) throw new Error('Reviewer approval required for final disposition');
 return true;
}
test('measurement limits are inclusive',()=>{
 assert.equal(evaluateMeasurement({value:5,min:5,max:8}),'pass');
 assert.equal(evaluateMeasurement({value:9,min:5,max:8}),'fail');
});
test('failed inspection is held for review, not silently accepted',()=>{
 assert.equal(resolveDisposition(['pass','fail']),'hold');
 assert.equal(resolveDisposition(['pass','pass']),'accepted');
});
test('final QC disposition requires reviewer identity',()=>{
 assert.throws(()=>validateDisposition('accepted',null));
 assert.equal(validateDisposition('rework',null),true);
});