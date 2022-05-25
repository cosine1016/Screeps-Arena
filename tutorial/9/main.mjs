import * as utils from 'game/utils';
import * as prototypes from 'game/prototypes';
import * as constants from 'game/constants';
import * as arena from 'arena';

export function loop() {
    var myCreeps    = utils.getObjectsByPrototype(prototypes.Creep).filter(creep => creep.my);
    var container   = utils.getObjectsByPrototype(prototypes.StructureContainer)[0];
    var constructionSites   = utils.getObjectsByPrototype(prototypes.ConstructionSite).filter(site => site.my);

    if(!constructionSites.length){
        utils.createConstructionSite({x: 50, y: 55}, prototypes.StructureTower);
    }

    myCreeps.forEach(creep => {
        console.log(creep.transfer(constructionSites[0], constants.RESOURCE_ENERGY))
        if(!creep.store[constants.RESOURCE_ENERGY]){
            if(creep.withdraw(container, constants.RESOURCE_ENERGY) == constants.ERR_NOT_IN_RANGE){
                creep.moveTo(container);
            }
        } else {
            if(creep.build(constructionSites[0]) == constants.ERR_NOT_IN_RANGE){
                creep.moveTo(constructionSites[0]);
            }
        }
    });
}
