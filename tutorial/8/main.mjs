import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

export function loop() {
    var mySpawn     = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
    var myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    var source     = utils.getObjectsByPrototype(prototypes.Source)[0];

    if(!myCreeps.length){
        mySpawn.spawnCreep([constants.MOVE, constants.WORK, constants.CARRY]); 
    }
    myCreeps.forEach(creep => {
        var carryMax = creep.body.filter(element => element.type == constants.CARRY).length * 50;
        console.log(carryMax);
        if(creep.store[constants.RESOURCE_ENERGY] < carryMax){
            if(creep.harvest(source) == constants.ERR_NOT_IN_RANGE){
                creep.moveTo(source);
            }
        } else {
            if(creep.transfer(mySpawn, constants.RESOURCE_ENERGY) == constants.ERR_NOT_IN_RANGE){
                creep.moveTo(mySpawn);
            }
        }
    });
}
