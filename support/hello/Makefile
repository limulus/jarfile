hello.jar: classes/net/desert/hello/Hello.class
	jar cfm hello.jar hello.manifest -C classes .

classes/net/desert/hello/Hello.class: classes src/net/desert/hello/Hello.java
	javac -sourcepath src src/net/desert/hello/Hello.java -d classes

classes:
	mkdir classes

clean:
	rm -rf classes hello.jar
