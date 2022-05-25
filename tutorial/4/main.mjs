import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

export function loop() {
    var myCreeps = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    var enemyCreep = utils.getObjectsByPrototype(prototypes.Creep).find(creep => !creep.my);
    myCreeps.forEach(element => {
        if(element.body.some(bodyPart => bodyPart.type == constants.ATTACK )){
            if(element.attack(enemyCreep) == constants.ERR_NOT_IN_RANGE) {
                element.moveTo(enemyCreep);
            }
        } else if(element.body.some(bodyPart => bodyPart.type == constants.RANGED_ATTACK)){
            if(element.rangedAttack(enemyCreep) == constants.ERR_NOT_IN_RANGE) {
                element.moveTo(enemyCreep);
            }
        }else if(element.body.some(bodyPart => bodyPart.type == constants.HEAL)){
            if(element.heal(myCreeps[0]) == constants.ERR_NOT_IN_RANGE) {
                element.moveTo(myCreeps[0]);
            }
        }
    });
    
}
