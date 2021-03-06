//树型组件（类似树形菜单）数据格式化的问题，由后台把原始查询的数据直接返回给前端，父子关系并未构建，
//因此需要前端JS来完成，后台返回的数据和下面的测试数据相似。
var data=[  
    {_id:1,pid:0,title:'A'},  //pid, 父节点的_id
    {_id:2,pid:4,title:"E[父C]"},  
    {_id:3,pid:7,title:"G[父F]"},  
    {_id:4,pid:1,title:"C[父A]"},  
    {_id:5,pid:6,title:"D[父B]"},  
    {_id:6,pid:0,title:'B'},  
    {_id:7,pid:4,title:"F[父C]"}  
    ];  

//关键变量pos，用于保存每个已添加到tree中的节点在tree中位置信息，
//比如上面测试数据父节点A添加到tree后，那么pos中增加一条数据，pos={”1“:[0]}，
// 1就是父节点A的_id，这样写便于查找，[0]表示父节点A在tree的第一个元素，即tree[0]，
//如果某个位置信息为[1,2,3]，那么表示这个节点在tree[1].children[2].children[3]，
function toTreeData(data){  
    var pos={};  
    var tree=[];  
    var i=0;  
    while(data.length!=0){  
        if(data[i].pid==0){ //这是顶级节点 
            tree.push({  //把顶级节点放入tree中
                key:data[i]._id,  
                title:data[i].username,  
                children:[]  
            });  
            pos[data[i]._id]=[tree.length-1]; //设置当前节点在tree中位置信息     
            data.splice(i,1); //从data中删除该节点
            i--;  
        }else{  // 当前节点是子节点
            var posArr=pos[data[i].pid];  //posArr = GET 当前节点的父节点在tree中位置信息，形如[0,3]
            if(posArr!=undefined){  //if 父节点已经在tree中，
                  
                var obj=tree[posArr[0]];  //得到父节点所属的顶级节点
                for(var j=1;j<posArr.length;j++){  
                    obj=obj.children[posArr[j]];  //得到当前节点的父节点
                }  
  
                obj.children.push({  //把当前节点挂在tree中其父节点的children中
                    key: data[i]._id,  
                    title: data[i].username,  
                    children:[]  
                });  
                pos[data[i]._id]=posArr.concat([obj.children.length-1]); //SET 当前节点点在tree中位置信息，形如[0,3,1]
                data.splice(i,1); //从data中删除该节点
                i--;  
            }  
        }  
        i++;  
        if(i>data.length-1){  
            i=0;  
        }  
    }  
    return tree;  
}  

//前面的测试数据经过上面代码中的方法格式化后如下：

[  
    {  
        "key": 1,  
        "title": "A",  
        "children": [  
            {  
                "key": 4,  
                "title": "C[父A]",  
                "children": [  
                    {  
                        "_id": 7,  
                        "title": "F[父C]",  
                        "children": [  
                            {  
                                "_id": 3,  
                                "title": "G[父F]",  
                                "children": []  
                            }  
                        ]  
                    },  
                    {  
                        "_id": 2,  
                        "title": "E[父C]",  
                        "children": []  
                    }  
                ]  
            }  
        ]  
    },  
    {  
        "_id": 6,  
        "title": "B",  
        "children": [  
            {  
                "_id": 5,  
                "title": "D[父B]",  
                "children": []  
            }  
        ]  
    }  
]  

//上面的测试数据的pos信息如下:
{  
    "1":[0],  
    "2":[0,0,1],  
    "3":[0,0,0,0],  
    "4":[0,0],  
    "5":[1,0],  
    "6":[1],  
    "7":[0,0,0]  
} 