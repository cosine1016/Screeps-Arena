import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

var i = 0;
export function loop() {
    var mySpawn     = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
    var myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    var flags       = utils.getObjectsByPrototype(prototypes.Flag); 
    
    if(myCreeps.length < 2){
        var creep = mySpawn.spawnCreep([constants.MOVE, constants.ATTACK]).object;
        creep.target = flags[i];
        if( i < flags.length - 1 ) { i++; }
    }
    myCreeps.forEach(creep => {
        creep.moveTo(creep.target)
    })
}
