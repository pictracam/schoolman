'use strict';

/**
 * @ngdoc service
 * @name SchoolMan.service:Registrar
 * @method addStudent
 * @method getStudent
 * @method getStudentByCourseUnsorted
 * @method getStudentByCourse
 * @description
 *
 * This service stores all student data and links students with classes and courses
 */
angular.module('SchoolMan')
  .service('Registrar', function Registrar(CourseCatalog, Data, $log) {
    
    var _students = [];
    var students = {};
    var courses = {};
    var classes = {};

    // This all happens in RAM. I think it's fast No need to serialize
    var registerStudent = function(studentId, courseId){

    	// if this is the first student, instantiate the course's student list
    	if(!courses.hasOwnProperty(courseId)){
			courses[courseId] = [];
		}

        // add the student to the course's student list
        if(courses[courseId].lastIndexOf(studentId) < 0){
            courses[courseId].push(studentId);
        }

		// add the course to the students course list
        if(students[studentId].courses.lastIndexOf(courseId) < 0){
           students[studentId].courses.push(courseId); 
        }
    		
    }

    self = {};

    /**
     * @ngdoc method
     * @name Schoolman.service:Registrar#getAverage
     * @methodOf SchoolMan.service:Registrar
     * @param {object} student see student object
     * @param {int} formIndex the index of the form
     * @param {int} groupIndex the index of the group
     * @description
     *
     * This method adds a student to all courses in their class
     */
    self.addStudent = function(student, marksheets){

            var form = student.form;
            var group= student.group;

    		// Register the student
    		students[student.id] = student;
            _students.push(student);

    		// Register the student in their class
			var classId = form + "-" + group;
			if(!classes.hasOwnProperty(classId)){
				classes[classId] = [];
			}
			classes[classId].push(student.id);

			// Register the student in all the class courses
    		angular.forEach(CourseCatalog.getCourses(form, group), function(course, courseIndex){
				registerStudent(student.id, course.id);
			});

            
    };

    self.save = function(callback){
        Data.save({students:_students}, callback);
    };


    /**
     * @ngdoc method
     * @name Schoolman.service:Registrar#getAverage
     * @methodOf SchoolMan.service:Registrar
     * @param {string} studentId 
     * @returns {object} student
     * @description
     *
     * This method looks up a student object by the studentId and returns the student
     */
    self.getStudent = function(studentId){
        return students[studentId];
    };


    /**
     * @ngdoc method
     * @name Schoolman.service:Registrar#getStudentsByCourseUnsorted
     * @methodOf SchoolMan.service:Registrar
     * @param {string} courseId 
     * @returns {array} students
     * @description
     *
     * This returns an unsorted list of students by courseId
     */
    self.getStudentsByCourseUnsorted = function(courseId){
            var courseList = courses[courseId];
            // $log.debug("Courses?", courseId, courses);
            // $log.debug("CourseList", courseList);
            // $log.debug("Num Student Keys", Object.keys(students).length, students);
            // $log.debug("Num Students", _students.length, _students);

            var studentList = courseList.map(function(studentId){
                return students[studentId];
            });
            return studentList;
    };


    /**
     * @ngdoc method
     * @name Schoolman.service:Registrar#getStudentsByCourse
     * @methodOf SchoolMan.service:Registrar
     * @param {string} courseId 
     * @returns {array} students
     * @description
     *
     * This returns a list of students sorted by name
     */
    self.getStudentsByCourse = function(courseId){
        var studentList = self.getStudentsByCourseUnsorted(courseId);
        studentList.sort(function(s1, s2){
            return s1.name.localeCompare(s2.name);
        });
        angular.forEach(studentList, function(student, studentIndex){
            student.roll = studentIndex + 1;
        });
        return studentList;
    };


    // Load students from Data
    Data.get("students", function(students){
        var studentsCopy = angular.copy(students);
        angular.forEach(studentsCopy, function(student, studentIndex){
            self.addStudent(student);
        });
    });

    return self;

  });
