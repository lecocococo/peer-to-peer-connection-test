// 잘 모르실 거 같은 부분은 peerjs api reference(document) 보시면 됩니다
// 링크: https://peerjs.com/docs/#api

// 완벽하게는 2명의 유저밖에 안됩니다.
//

const socket = io("/");
const textGrid = document.querySelector("#text-grid");

// peer 설정
let myPeer = new Peer(undefined, {
  host: "127.0.0.1",
  port: "12346",
});

let peers = {};
// let counter = 0;
let connection;

// 제가 사용한 텍스트 에디터 입니다.
// 깃헙에 simpleMDE치시고 보시고
// simpleMDE에 나와 있지 않은 부분은 codeMirror라는 것을 깃헙이나 구글에서
// 찾아서 봐야합니다
var simplemde = new SimpleMDE({
  element: document.getElementById("text"),
  // placeholder: "Share the link to invite collaborators to your document.",
  spellChecker: false,
  initialValue: "Hello world!",
  autofocus: false,
  indentWithTabs: true,
  tabSize: 4,
  indentUnit: 4,
  lineWrapping: false,
  shortCuts: [],
});

// peerServer로 연결이 되면 실행이 됩니다.
// 가장 먼저 실행됨
myPeer.on("open", (id) => {
  console.log("peer id: " + id);
  console.log("ROOM ID: " + ROOM_ID);
  socket.emit("join-room", ROOM_ID, id);
});

// remote peer에 의해 새로운 연결이 시작되면 실행됩니다.
myPeer.on("connection", (conn) => {
  console.log("Listening...");
  for (var i in peers) {
    console.log(peers[i].peer);
  }
  //연결이 되고 사용가능해지면 실행 됩니다.
  conn.on("open", function () {
    // 데이터 받아지는 부분, 콘솔에서 받은 데이터 보기 가능
    conn.on("data", function (data) {
      console.log("Received", data);

      connectToNewUser(data);
      // sendOriginText(connection);
      modifyText(connection);
    });
  });
});

// user-connected라는 이벤트를 server.js로부터 받아서
// 첫 실행시 새로운 유저 추가 해주는 메서드
// 두번째로 실행됨
socket.on("user-connected", (userId) => {
  console.log("New User Connected: " + userId);
  const ctn = () => connectToNewUser(userId);
  time = setTimeout(ctn, 200);

  // setTimeout(connection.send("조ㅑ조ㅑ"), 200);
});

// user-disconnected라는 이벤트를 server.js로부터 받아서
// 유저를 없애는 메서드
// 유저가 방을 나가면 실행됨
socket.on("user-disconnected", (userId) => {
  console.log("User Disconnected: ", userId);
  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }
});

// 두 피어를 양방향으로 연결해주고
// connection을 열어줍니다.
function connectToNewUser(userId) {
  connection = myPeer.connect(userId); // 받은 userId 연결

  connection.on("open", () => {
    if (!peers.hasOwnProperty(connection.peer)) {
      peers[userId] = connection;
      connection.send(myPeer.id);
      // connection.send(Object.keys(peers));
      console.log("피어 보내짐");
    }

    setTimeout(sendOriginText(connection), 1000);
  });

  // 텍스트 수정
  // modifyText(connection);

  connection.on("close", () => {});

  console.log(connection.peerConnection);
}

// 텍스트가 수정되고 다른 피어로 send되는 메소드입니다.
function modifyText(connection) {
  simplemde.codemirror.on("beforeChange", function (cm, obj) {
    var doc = simplemde.codemirror.getDoc();
    var cursor = doc.getCursor();
    console.log(obj);
    console.log(doc);
    console.log(cursor);
    // console.log("이거 뜸 " + peers[myPeer.id]);

    // 글자 입력, 글자 삭제 처리 부분
    if (obj.origin === "+input") {
      // console.log(myPeer.id);

      // console.log("피어 연결안됨?: " + myPeer.disconnected);

      // console.log(connection.open);
      // console.log(connection.dataChannel);

      // text editor에 적힌 값이 보내지는 부분
      connection.send(obj.text);
    } else if (obj.origin === "+delete") {
      //이쪽은 글자 삭제시 지워져야됨
      if (cursor.ch > 0) {
        ///////////////////
        // 구현 필요!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        ///////////////////
      }
    }
  });
}

// 아직 테스트 중인 메소드입니다
function sendOriginText(connection) {
  console.log("들어옴");
  const test = textGrid
    .querySelector(".CodeMirror-code")
    .querySelectorAll("span");

  console.log(test);
  setTimeout(() => {
    for (let i = 0; i < test.length; i++) {
      connection.send(test[i].innerHTML);
    }
  }, 550);
}
