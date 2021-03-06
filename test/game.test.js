import Game from '../src/js/game';
import Display from '../src/js/display';
import Board from '../src/js/board';

jest.mock('../src/js/display');
jest.mock('../src/js/board');

beforeEach(() => {
  jest.clearAllMocks();
});

it('Game constructor should instantiate classes and properties', () => {
  const game = new Game();

  expect(Board).toHaveBeenCalledTimes(1);
  expect(game.player1).toStrictEqual({});
  expect(game.player2).toStrictEqual({});
  expect(game.currentPlayer).toStrictEqual({});

  const displayFormMock = Display.displayForm;

  expect(displayFormMock).toHaveBeenCalledTimes(1);
  const handlePlayerSubmit = displayFormMock.mock.calls[0][0];
  const playerData = {
    player1: {
      name: 'player1',
      character: '1',
    },
    player2: {
      name: 'player2',
      character: '2',
    },
  };

  const displaySideCardMock = Display.displaySideCard;
  const tileClickListenerMock = Display.tileClickListener;

  handlePlayerSubmit(playerData);

  expect(displaySideCardMock).toHaveBeenCalledTimes(1);
  expect(game.player1).toMatchObject({ name: 'player1', character: '1' });
  expect(game.player2).toMatchObject({ name: 'player2', character: '2' });
  expect(tileClickListenerMock).toHaveBeenCalledTimes(1);
});

test('Should setup nextPlayer', () => {
  const game = new Game();

  const player1 = { name: 'player1', character: '1' };
  const player2 = { name: 'player2', character: '2' };
  game.player1 = player1;
  game.player2 = player2;

  expect(game.currentPlayer).toMatchObject({});
  game.nextPlayer();
  expect(game.currentPlayer).toMatchObject(player1);
  game.nextPlayer();
  expect(game.currentPlayer).toMatchObject(player2);
});

test('Should setup turn', () => {
  const game = new Game();
  const player1 = { name: 'player1', character: '1' };
  const player2 = { name: 'player2', character: '2' };
  game.player1 = player1;
  game.player2 = player2;

  const nextPlayerSpy = jest.spyOn(game, 'nextPlayer');

  game.setupTurn();
  expect(nextPlayerSpy).toHaveBeenCalledTimes(1);

  const displaySideCardSpy = jest.spyOn(Display, 'displaySideCard');
  const displayMessageSpy = jest.spyOn(Display, 'displayMessage');

  expect(displaySideCardSpy).toHaveBeenCalledTimes(1);
  expect(displayMessageSpy).toHaveBeenCalledTimes(1);

  const playerName = game.currentPlayer.name;
  const playerChar = game.currentPlayer.character;

  const displayMessageArgument = displayMessageSpy.mock.calls[0][0];
  const expectedMessageString = `${playerName}'s turn (${playerChar})`;
  expect(displayMessageArgument).toBe(expectedMessageString);
});

test('Should execute normal turn', () => {
  const game = new Game();

  const tileIndex = 0;
  const [row, col] = [0, 0];
  const currentCharacter = 'C';

  game.currentPlayer = { character: currentCharacter };
  const setupTurnSpy = jest.spyOn(game, 'setupTurn');

  const mockBoardInstance = Board.mock.instances[0];

  const indexToCoordinatesMock = Board.indexToCoordinates;
  const isAvailableMock = mockBoardInstance.isAvailable;
  const fillSpaceMock = mockBoardInstance.fillSpace;
  const fillTileMock = Display.fillTile;
  const isWinMock = mockBoardInstance.isWin;
  const isTieMock = mockBoardInstance.isTie;

  indexToCoordinatesMock.mockReturnValueOnce([row, col]);
  isAvailableMock.mockReturnValueOnce(true);
  isWinMock.mockReturnValueOnce(false);
  isTieMock.mockReturnValueOnce(false);

  game.executeTurn(tileIndex);

  expect(indexToCoordinatesMock).toHaveBeenCalledTimes(1);
  expect(isAvailableMock).toHaveBeenCalledTimes(1);
  expect(fillSpaceMock).toHaveBeenCalledTimes(1);
  expect(fillSpaceMock.mock.calls[0]).toEqual([row, col, currentCharacter]);
  expect(fillTileMock).toHaveBeenCalledTimes(1);
  expect(fillTileMock.mock.calls[0]).toEqual([tileIndex, currentCharacter]);
  expect(setupTurnSpy).toHaveBeenCalledTimes(1);
});

test('Should execute win turn', () => {
  const game = new Game();

  const tileIndex = 0;
  const [row, col] = [0, 0];
  const currentCharacter = 'C';
  const currentName = 'Winner';

  game.currentPlayer = {
    name: currentName,
    character: currentCharacter,
  };

  const handleRematchSpy = jest.spyOn(game, 'handleRematch');

  const mockBoardInstance = Board.mock.instances[0];

  const isAvailableMock = mockBoardInstance.isAvailable;
  const isWinMock = mockBoardInstance.isWin;
  const clearBoardDataMock = mockBoardInstance.clearBoardData;
  const indexToCoordinatesMock = Board.indexToCoordinates;

  const displayMessageSpy = jest.spyOn(Display, 'displayMessage');
  const displayWinSpy = jest.spyOn(Display, 'displayWin');

  indexToCoordinatesMock.mockReturnValueOnce([row, col]);
  isAvailableMock.mockReturnValueOnce(true);
  isWinMock.mockReturnValueOnce(true);

  game.executeTurn(tileIndex);

  expect(displayMessageSpy).toHaveBeenCalledTimes(1);

  const winMessage = `${currentName} wins!`;
  expect(displayMessageSpy.mock.calls[0][0]).toBe(winMessage);
  expect(displayWinSpy).toHaveBeenCalledTimes(1);
  expect(clearBoardDataMock).toHaveBeenCalledTimes(1);
  expect(handleRematchSpy).toHaveBeenCalledTimes(1);
});

test('Should execute tie turn', () => {
  const game = new Game();

  const tileIndex = 0;
  const [row, col] = [0, 0];

  const handleRematchSpy = jest.spyOn(game, 'handleRematch');

  const mockBoardInstance = Board.mock.instances[0];

  const isAvailableMock = mockBoardInstance.isAvailable;
  const isWinMock = mockBoardInstance.isWin;
  const isTieMock = mockBoardInstance.isTie;
  const clearBoardDataMock = mockBoardInstance.clearBoardData;
  const indexToCoordinatesMock = Board.indexToCoordinates;

  const clearBoardSpy = jest.spyOn(Display, 'clearBoard');
  const displayMessageSpy = jest.spyOn(Display, 'displayMessage');

  indexToCoordinatesMock.mockReturnValueOnce([row, col]);
  isAvailableMock.mockReturnValueOnce(true);
  isWinMock.mockReturnValueOnce(false);
  isTieMock.mockReturnValueOnce(true);

  jest.clearAllMocks();
  game.executeTurn(tileIndex);

  expect(displayMessageSpy).toHaveBeenCalledTimes(1);

  const tieMessage = "It's a tie!";
  expect(displayMessageSpy.mock.calls[0][0]).toBe(tieMessage);
  expect(clearBoardDataMock).toHaveBeenCalledTimes(1);
  expect(clearBoardSpy).toHaveBeenCalledTimes(1);
  expect(handleRematchSpy).toHaveBeenCalledTimes(1);
});

test('Shoud handleRematch', () => {
  const game = new Game();
  const setupTurnSpy = jest.spyOn(game, 'setupTurn');

  const displayReplayMock = Display.displayReplay;

  game.handleRematch();

  const tileClickListenerMock = Display.tileClickListener;
  const clearBoardMock = Display.clearBoard;
  const displayFormMock = Display.displayForm;

  const onRematch = displayReplayMock.mock.calls[0][0];
  const onRedo = displayReplayMock.mock.calls[0][1];


  clearBoardMock.mockClear();
  displayFormMock.mockClear();

  onRedo();

  expect(clearBoardMock).toHaveBeenCalledTimes(1);
  expect(displayFormMock).toHaveBeenCalledTimes(1);

  clearBoardMock.mockClear();
  tileClickListenerMock.mockClear();

  onRematch();

  expect(clearBoardMock).toHaveBeenCalledTimes(1);
  expect(setupTurnSpy).toHaveBeenCalledTimes(1);
  expect(tileClickListenerMock).toHaveBeenCalledTimes(1);
});
