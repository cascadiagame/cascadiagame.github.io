var startingTiles = [
    [
        {
            tileNum: '1',
            habitats: ['mountain'],
            wildlife: ['bear'],
            rotation: 0 // increments of 60
        },
        {
            tileNum: '2',
            habitats: ['forest', 'swamp'],
            wildlife: ['hawk', 'fox', 'elk'],
            rotation: 60 // increments of 60
        },
        {
            tileNum: '3',
            habitats: ['desert', 'lake'],
            wildlife: ['salmon', 'bear'],
            rotation: 300 // increments of 60
        },
    ],
    [
        {
            tileNum: '4',
            habitats: ['swamp'],
            wildlife: ['hawk'],
            rotation: 0 // increments of 60
        },
        {
            tileNum: '5',
            habitats: ['forest', 'lake'],
            wildlife: ['salmon', 'hawk', 'elk'],
            rotation: 240 // increments of 60
        },
        {
            tileNum: '6',
            habitats: ['mountain', 'desert'],
            wildlife: ['bear', 'fox'],
            rotation: 300 // increments of 60
        },
    ],
    [
        {
            tileNum: '7',
            habitats: ['desert'],
            wildlife: ['fox'],
            rotation: 0 // increments of 60
        },
        {
            tileNum: '8',
            habitats: ['swamp', 'lake'],
            wildlife: ['salmon', 'fox', 'hawk'],
            rotation: 60 // increments of 60
        },
        {
            tileNum: '9',
            habitats: ['mountain', 'forest'],
            wildlife: ['bear', 'elk'],
            rotation: 300 // increments of 60
        },
    ],
    [
        {
            tileNum: '10',
            habitats: ['forest'],
            wildlife: ['elk'],
            rotation: 0 // increments of 60
        },
        {
            tileNum: '11',
            habitats: ['lake', 'mountain'],
            wildlife: ['hawk', 'bear', 'elk'],
            rotation: 240 // increments of 60
        },
        {
            tileNum: '12',
            habitats: ['desert', 'swamp'],
            wildlife: ['fox', 'salmon'],
            rotation: 300 // increments of 60
        },
    ],
    [
        {
            tileNum: '13',
            habitats: ['lake'],
            wildlife: ['salmon'],
            rotation: 0 // increments of 60
        },
        {
            tileNum: '14',
            habitats: ['forest', 'desert'],
            wildlife: ['salmon', 'bear', 'elk'],
            rotation: 240 // increments of 60
        },
        {
            tileNum: '15',
            habitats: ['mountain', 'swamp'],
            wildlife: ['fox', 'hawk'],
            rotation: 120 // increments of 60
        },
    ],

]

var tiles = [
    {
        tileNum: '16',
        habitats: ['mountain'],
        wildlife: ['hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '17',
        habitats: ['mountain'],
        wildlife: ['hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '18',
        habitats: ['mountain'],
        wildlife: ['bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '19',
        habitats: ['mountain'],
        wildlife: ['elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '20',
        habitats: ['mountain'],
        wildlife: ['elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '21',
        habitats: ['forest'],
        wildlife: ['bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '22',
        habitats: ['forest'],
        wildlife: ['bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '23',
        habitats: ['forest'],
        wildlife: ['elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '24',
        habitats: ['forest'],
        wildlife: ['fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '25',
        habitats: ['forest'],
        wildlife: ['fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '26',
        habitats: ['desert'],
        wildlife: ['elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '27',
        habitats: ['desert'],
        wildlife: ['elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '28',
        habitats: ['desert'],
        wildlife: ['fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '29',
        habitats: ['desert'],
        wildlife: ['salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '30',
        habitats: ['desert'],
        wildlife: ['salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '31',
        habitats: ['swamp'],
        wildlife: ['fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '32',
        habitats: ['swamp'],
        wildlife: ['fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '33',
        habitats: ['swamp'],
        wildlife: ['salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '34',
        habitats: ['swamp'],
        wildlife: ['salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '35',
        habitats: ['swamp'],
        wildlife: ['hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '36',
        habitats: ['lake'],
        wildlife: ['hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '37',
        habitats: ['lake'],
        wildlife: ['hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '38',
        habitats: ['lake'],
        wildlife: ['salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '39',
        habitats: ['lake'],
        wildlife: ['bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '40',
        habitats: ['lake'],
        wildlife: ['bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '41',
        habitats: ['mountain', 'forest'],
        wildlife: ['hawk', 'bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '42',
        habitats: ['mountain', 'forest'],
        wildlife: ['fox', 'bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '43',
        habitats: ['mountain', 'desert'],
        wildlife: ['fox', 'bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '44',
        habitats: ['mountain', 'desert'],
        wildlife: ['salmon', 'fox', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '45',
        habitats: ['forest', 'desert'],
        wildlife: ['salmon', 'fox', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '46',
        habitats: ['desert', 'swamp'],
        wildlife: ['salmon', 'fox', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '47',
        habitats: ['desert', 'swamp'],
        wildlife: ['salmon', 'fox', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '48',
        habitats: ['mountain', 'swamp'],
        wildlife: ['fox', 'hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '49',
        habitats: ['mountain', 'swamp'],
        wildlife: ['salmon', 'bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '50',
        habitats: ['forest', 'swamp'],
        wildlife: ['salmon', 'hawk', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '51',
        habitats: ['swamp', 'lake'],
        wildlife: ['salmon', 'hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '52',
        habitats: ['forest', 'lake'],
        wildlife: ['hawk', 'fox', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '53',
        habitats: ['lake', 'mountain'],
        wildlife: ['salmon', 'hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '54',
        habitats: ['desert', 'lake'],
        wildlife: ['salmon', 'fox', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '55',
        habitats: ['desert', 'lake'],
        wildlife: ['fox', 'hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '56',
        habitats: ['mountain', 'forest'],
        wildlife: ['hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '57',
        habitats: ['mountain', 'forest'],
        wildlife: ['hawk', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '58',
        habitats: ['mountain', 'forest'],
        wildlife: ['bear', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '59',
        habitats: ['mountain', 'forest'],
        wildlife: ['elk', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '60',
        habitats: ['forest', 'desert'],
        wildlife: ['bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '61',
        habitats: ['forest', 'desert'],
        wildlife: ['bear', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '62',
        habitats: ['forest', 'desert'],
        wildlife: ['elk', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '63',
        habitats: ['forest', 'desert'],
        wildlife: ['elk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '64',
        habitats: ['forest', 'desert'],
        wildlife: ['fox', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '65',
        habitats: ['desert', 'swamp'],
        wildlife: ['elk', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '66',
        habitats: ['desert', 'swamp'],
        wildlife: ['elk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '67',
        habitats: ['desert', 'swamp'],
        wildlife: ['fox', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '68',
        habitats: ['desert', 'swamp'],
        wildlife: ['salmon', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '69',
        habitats: ['swamp', 'lake'],
        wildlife: ['fox', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '70',
        habitats: ['swamp', 'lake'],
        wildlife: ['fox', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '71',
        habitats: ['swamp', 'lake'],
        wildlife: ['salmon', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '72',
        habitats: ['swamp', 'lake'],
        wildlife: ['salmon', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '73',
        habitats: ['swamp', 'lake'],
        wildlife: ['hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '74',
        habitats: ['lake', 'mountain'],
        wildlife: ['salmon', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '75',
        habitats: ['lake', 'mountain'],
        wildlife: ['salmon', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '76',
        habitats: ['lake', 'mountain'],
        wildlife: ['hawk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '77',
        habitats: ['lake', 'mountain'],
        wildlife: ['hawk', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '78',
        habitats: ['lake', 'mountain'],
        wildlife: ['bear', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '79',
        habitats: ['mountain', 'desert'],
        wildlife: ['hawk', 'elk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '80',
        habitats: ['mountain', 'desert'],
        wildlife: ['hawk', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '81',
        habitats: ['mountain', 'desert'],
        wildlife: ['bear', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '82',
        habitats: ['mountain', 'desert'],
        wildlife: ['elk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '83',
        habitats: ['mountain', 'swamp'],
        wildlife: ['hawk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '84',
        habitats: ['mountain', 'swamp'],
        wildlife: ['bear', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '85',
        habitats: ['mountain', 'swamp'],
        wildlife: ['elk', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '86',
        habitats: ['mountain', 'swamp'],
        wildlife: ['elk', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '87',
        habitats: ['forest', 'swamp'],
        wildlife: ['bear', 'fox'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '88',
        habitats: ['forest', 'swamp'],
        wildlife: ['bear', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '89',
        habitats: ['forest', 'swamp'],
        wildlife: ['elk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '90',
        habitats: ['forest', 'swamp'],
        wildlife: ['elk', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '91',
        habitats: ['forest', 'swamp'],
        wildlife: ['fox', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '92',
        habitats: ['forest', 'lake'],
        wildlife: ['bear', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '93',
        habitats: ['forest', 'lake'],
        wildlife: ['fox', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '94',
        habitats: ['forest', 'lake'],
        wildlife: ['elk', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '95',
        habitats: ['forest', 'lake'],
        wildlife: ['elk', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '96',
        habitats: ['forest', 'lake'],
        wildlife: ['fox', 'bear'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '97',
        habitats: ['desert', 'lake'],
        wildlife: ['elk', 'salmon'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '98',
        habitats: ['desert', 'lake'],
        wildlife: ['elk', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '99',
        habitats: ['desert', 'lake'],
        wildlife: ['fox', 'hawk'],
        rotation: 0 // increments of 60
    },
    {
        tileNum: '100',
        habitats: ['desert', 'lake'],
        wildlife: ['fox', 'bear'],
        rotation: 0 // increments of 60
    }
    
]