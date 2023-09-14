const frameRate = 8;
const fourDirections  = ["-se", "-sw", "-ne", "-nw"];

export const unitTypes = {
    human: {
        fileName: 'Human',
        baseKey: 'human',
        sheetFileNames: [
            {fileName: 'Walk', ssKey: 'walk'},
            {fileName: 'Idle', ssKey: 'idle'},
            {fileName: 'Dmg', ssKey: 'damage'},
            {fileName: 'Attack', ssKey: 'attack'},
            {fileName: 'SpinDie', ssKey: 'die'}
        ],
        frameConfig: {frameWidth: 32, frameHeight: 32},
        anims: [
            {animKey:'walk', ssKey:'walk', sheetLength: 4, 'frameRate': frameRate, repeat: -1, directions: fourDirections},
            {animKey:'idle', ssKey:'idle', sheetLength: 16, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'damage', ssKey:'damage', sheetLength: 4, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'attack', ssKey:'attack', sheetLength: 4, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'die', ssKey:'die', sheetLength: 4, 'frameRate': 12, frameRate, repeat: 0, },
        ]
    },
    orc: {
        fileName: 'Orc',
        baseKey: 'orc',
        sheetFileNames: [
            {fileName: 'Walk', ssKey: 'walk'},
            {fileName: 'Idle', ssKey: 'idle'},
            {fileName: 'Dmg', ssKey: 'damage'},
            {fileName: 'Attack', ssKey: 'attack'},
            {fileName: 'Die', ssKey: 'die'}
        ],
        frameConfig: {frameWidth: 32, frameHeight: 32},
        anims: [
            {animKey:'walk', ssKey:'walk', sheetLength: 4, 'frameRate': frameRate, repeat: -1, directions: fourDirections},
            {animKey:'idle', ssKey:'idle', sheetLength: 16, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'damage', ssKey:'damage', sheetLength: 4, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'attack', ssKey:'attack', sheetLength: 4, 'frameRate': frameRate, repeat: 0, directions: fourDirections},
            {animKey:'die', ssKey:'die', sheetLength: 4, 'frameRate': 12, frameRate, repeat: 0, },
        ]
    },
}