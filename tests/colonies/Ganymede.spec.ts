import {expect} from 'chai';
import {Ganymede} from '../../src/colonies/Ganymede';
import {Color} from '../../src/Color';
import {Player} from '../../src/Player';
import {Game} from '../../src/Game';
import {Resources} from '../../src/Resources';

describe('Ganymede', function() {
  let ganymede: Ganymede; let player: Player; let player2: Player; let game: Game;

  beforeEach(function() {
    ganymede = new Ganymede();
    player = new Player('test', Color.BLUE, false);
    player2 = new Player('test2', Color.RED, false);
    game = new Game('foobar', [player, player2], player);
    game.gameOptions.coloniesExtension = true;
    game.colonies.push(ganymede);
  });

  it('Should build', function() {
    ganymede.addColony(player, game);
    expect(player.getProduction(Resources.PLANTS)).to.eq(1);
    expect(player2.getProduction(Resources.PLANTS)).to.eq(0);
  });

  it('Should trade', function() {
    ganymede.trade(player, game);
    expect(player.plants).to.eq(1);
    expect(player2.plants).to.eq(0);
  });

  it('Should give trade bonus', function() {
    ganymede.addColony(player, game);

    ganymede.trade(player2, game);
    game.deferredActions.runAll(() => {});

    expect(player.getProduction(Resources.PLANTS)).to.eq(1);
    expect(player2.getProduction(Resources.PLANTS)).to.eq(0);
    expect(player.plants).to.eq(1);
    expect(player2.plants).to.eq(1);
  });
});
