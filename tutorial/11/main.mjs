import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

const spawnPlanBodyParts = [
    [constants.MOVE, constants.MOVE, constants.WORK, constants.CARRY],
    [constants.MOVE, constants.MOVE, constants.WORK, constants.CARRY],
    [constants.MOVE, constants.ATTACK],
    [constants.MOVE, constants.ATTACK],
    [constants.MOVE, constants.RANGED_ATTACK],
    [constants.MOVE, constants.RANGED_ATTACK],
    [constants.MOVE, constants.HEAL],
    [constants.MOVE, constants.HEAL],
];

var spawnNum = 0;

export function loop() {
    var mySpawn     = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
    var myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);

    console.log(spawnNum)
    if(mySpawn.spawnCreep(spawnPlanBodyParts[spawnNum]).object){
        spawnNum++;
        if(spawnNum + 1 >= spawnPlanBodyParts.length){ spawnNum = 0; }
    }
    var carrys          = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.CARRY ));
    var atacks          = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.ATTACK ));
    var rangeAttacks    = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.RANGED_ATTACK ));
    var heals           = myCreeps.filter( creep => creep.body.some(bodyPart => bodyPart.type == constants.HEAL ));

    carrys.forEach(carryLoop);
    atacks.forEach(attackLoop);
    rangeAttacks.forEach(rangeAttackLoop);
    heals.forEach(healLoop);
}

function carryLoop(creep){
    var mySpawn     = utils.getObjectsByPrototype(prototypes.StructureSpawn)[0];
    var source     = utils.getObjectsByPrototype(prototypes.Source)[0];
    var carryMax = creep.body.filter(element => element.type == constants.CARRY).length * 50;
    if(creep.store[constants.RESOURCE_ENERGY] < carryMax){
        if(creep.harvest(source) == constants.ERR_NOT_IN_RANGE){
            creep.moveTo(source);
        }
    } else {
        if(creep.transfer(mySpawn, constants.RESOURCE_ENERGY) == constants.ERR_NOT_IN_RANGE){
            creep.moveTo(mySpawn);
        }
    }
}

function attackLoop(creep){    
    var enemyCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
    if(creep.attack(enemyCreep) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(enemyCreep);
    }
}
function rangeAttackLoop(creep){
    var enemyCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
    if(creep.rangedAttack(enemyCreep) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(enemyCreep);
    }
}
function healLoop(creep){
    var damagedCreep    = utils.getObjectsByPrototype(prototypes.Creep).find(creep => creep.my && creep.hits != creep.hitsMax);
    var defaultCreep    = utils.getObjectsByPrototype(prototypes.Creep).find(creep => creep.my);

    if(creep.body.some(bodyPart => bodyPart.type == constants.HEAL)){
        if(creep.heal(damagedCreep) == constants.ERR_NOT_IN_RANGE) {
            creep.moveTo(damagedCreep);
        }
    } else{
        creep.moveTo(defaultCreep);
    }
}